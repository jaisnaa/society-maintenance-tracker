# System Design Write-up — Society Maintenance Tracker

## Complaint History Model

Instead of keeping only the current complaint status and losing information about what happened before, the system stores the **current state and the complete status history separately**.

Each complaint has a `status` and `priority` field that stores its current state. This makes it quick to display complaints in lists and calculate dashboard statistics. Whenever an admin changes the status, a new entry is added to the `complaint_history` table. Each history entry stores the complaint ID, the new status, an optional admin note, and the time of the change.

I chose this approach instead of storing the entire history inside a JSON field because a separate relational table makes the data much easier to search and manage. For example, finding all complaints that have been open for several days or displaying the complete timeline of a particular complaint can be done directly through database queries without having to parse stored JSON.

The current status is also updated at the same time as the history entry is created. This keeps the complaint's current state and its history consistent. When a resident opens **My Complaints**, the API returns the complaint along with its complete history, allowing the resident to see how the issue has progressed without making multiple requests.

---

## Overdue Detection

The system does not store an `is_overdue` value permanently in the database. Instead, it calculates whether a complaint is overdue whenever the complaints or dashboard data are requested.

Every complaint has a `created_at` timestamp, and the number of days considered overdue is controlled using the `OVERDUE_THRESHOLD_DAYS` environment variable. The default value is **5 days**.

When an admin views the complaints or dashboard, the backend checks complaints that are still in `Open` status and compares their creation time with the current time. If a complaint has been open longer than the configured threshold, it is marked as overdue in the API response.

I used this approach to avoid storing a value that could become outdated. For example, a complaint might not be overdue today but could become overdue tomorrow. If it were stored as a simple boolean, the application would need a background process to continuously update it.

Calculating it when the data is requested keeps the logic simple and ensures that the result is always current. Since a typical apartment society will not have thousands of complaints being created every second, the small amount of extra computation is not a concern.

Overdue complaints are displayed prominently in the admin view and are also included separately in the dashboard statistics, making it easier for administrators to identify complaints that need attention.

---

## Photo Handling

Residents can optionally attach a photo when raising a complaint. The image is sent to the backend as part of a multipart form request.

Instead of storing the actual image inside PostgreSQL, the backend uploads it to **Cloudinary** and stores only the returned image URL in the complaint record.

This keeps the database smaller and avoids storing large binary files directly in PostgreSQL. It also makes image delivery easier because Cloudinary is designed for image storage, transformation, and delivery.

This approach is particularly useful because the backend is deployed on Render, where the application filesystem is not intended for permanent file storage. Even if the backend restarts or is redeployed, the images remain safely stored in Cloudinary.

On the frontend, uploaded photos are shown as thumbnails along with the complaint. Clicking on a thumbnail opens the image in a larger lightbox view, which makes it easier for administrators to inspect the issue before deciding its priority or taking action.

---

## Notification Flow

The application sends email notifications for two main events:

* When an admin changes the status of a complaint.
* When an admin creates an important notice.

Both types of notifications use a shared email utility that communicates with **Brevo's transactional email API**.

Initially, email was implemented using SMTP. However, this created problems when deploying the application because some hosting providers restrict outbound SMTP connections on their free tiers. This meant that something that worked correctly on the local machine could fail after deployment.

Using Brevo's HTTPS API avoids this problem because the application simply makes a normal web request to the email service. This made the email functionality more reliable in the deployed application.

For complaint status updates, the email is sent as part of the same request because there is normally only one recipient — the resident who raised the complaint. The extra processing time is small enough that it does not significantly affect the user experience.

Important notices are handled differently because they may need to be sent to **all residents**. Sending every email before responding to the admin would make the notice creation request take much longer. It could also cause problems if one email failed while the others were still waiting to be sent.

To avoid this, important notice emails are handled using FastAPI's `BackgroundTask`. The notice is first saved to the database and the API responds to the admin immediately. The email sending then continues in the background.

Each email is also handled separately, so if sending to one resident fails, the remaining residents can still receive the notification.

This approach prioritizes a **fast user experience and reasonable reliability**. Since this is a society management application rather than a system where every notification is business-critical, accepting the small possibility of an interrupted background task is a reasonable trade-off at this scale.
