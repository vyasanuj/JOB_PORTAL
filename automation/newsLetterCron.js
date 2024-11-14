import cron from "node-cron";
import { Job } from "../src/models/Job.model.js";
import { User } from "../src/models/User.model.js";
import { sendEmail } from "../src/utils/sendEmail.js";

// export const newsLetterCron = () => {
//     cron.schedule("*/1 * * * *", async () => {
//       console.log("Running Cron Automation");
  
//       const jobs = await Job.find({ newsLettersSent: false });
//       console.log(jobs)
//       for (const job of jobs) {
//         try {            
//           // Fetch users who are interested in this job's niche
//           const filteredUsers = await User.find({
//             $or: [
//               { "niches.firstNiche": job.jobNiche },
//               { "niches.secondNiche": job.jobNiche },
//               { "niches.thirdNiche": job.jobNiche },
//             ],
//           });

//           console.log(filteredUsers)

//             for (const user of filteredUsers) {
//             const subject = `Hot Job Alert: ${job.title} in ${job.jobNiche} Available Now`;
//             const message = `Hi ${user.name},\n\nGreat news! A new job that fits your niche has just been posted. The position is for a ${job.title} with ${job.companyName}, and they are looking to hire immediately.\n\nJob Details:\n- **Position:** ${job.title}\n- **Company:** ${job.companyName}\n- **Location:** ${job.location}\n- **Salary:** ${job.salary}\n\nDon’t wait too long! Job openings like these are filled quickly.\n\nWe’re here to support you in your job search. Best of luck!\n\nBest Regards,\nNicheNest Team`;
  
//             await sendEmail({
//               email: user.Email,
//               subject,
//               message,
//             });
  
//             console.log(`Sending email to: ${user.Email}`);
//           }
  
//           // Mark job as processed
//           job.newsLettersSent = true;
//           await job.save();
//         } catch (error) {
//           console.error("ERROR IN NODE CRON CATCH BLOCK:", error);
//         }
//       }
//     });
//   };
  

export const newsLetterCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running Cron Automation");

    // Fetch jobs that haven't had newsletters sent
    const jobs = await Job.find({ newsLettersSent: false });
    console.log("Jobs fetched:", jobs);

    for (const job of jobs) {
      try {
        // Log trimmed job niche
        const jobNiche = job.jobNiche.trim().toLowerCase();
        console.log("Job Niche (trimmed):", jobNiche);

        // Fetch all users
        const users = await User.find({});
        users.forEach(user => {
          // Log user niches with trimming for better comparison
          console.log("User Niches:", {
            firstNiche: user.Niches?.firstNiche?.trim(),
            secondNiche: user.Niches?.secondNiche?.trim(),
            thirdNiche: user.Niches?.thirdNiche?.trim(),
          });
        });

        // Test query to confirm if any users are matched by "dev oops"
        const testUsers = await User.find({ "Niches.secondNiche": "dev oops" });
        console.log("Test Users Found for 'dev oops':", testUsers.length);

        // Filter users based on job niche
        const filteredUsers = await User.find({
          $or: [
            { "Niches.firstNiche": { $regex: new RegExp(`^${jobNiche}$`, 'i') } },
            { "Niches.secondNiche": { $regex: new RegExp(`^${jobNiche}$`, 'i') } },
            { "Niches.thirdNiche": { $regex: new RegExp(`^${jobNiche}$`, 'i') } },
          ],
        });

        console.log(`Filtered users for job: ${job.title} - ${filteredUsers.length} users found`);
        for (const user of filteredUsers) {
          console.log("Filtered User:", user.Username, "Niches:", user.Niches);
        }

        if (filteredUsers.length === 0) {
          console.log("No users found for this job niche.");
        }

        for (const user of filteredUsers) {
          const subject = `Hot Job Alert: ${job.title} in ${job.jobNiche} Available Now`;
          const message = `Hi ${user.Username},\n\nGreat news! A new job that fits your niche has just been posted. The position is for a ${job.title} with ${job.companyName}, and they are looking to hire immediately.\n\nJob Details:\n- **Position:** ${job.title}\n- **Company:** ${job.companyName}\n- **Location:** ${job.location}\n- **Salary:** ${job.salary}\n\nDon’t wait too long! Job openings like these are filled quickly.\n\nWe’re here to support you in your job search. Best of luck!\n\nBest Regards,\nNicheNest Team`;

          await sendEmail({
            email: user.Email,
            subject,
            message,
          });

          console.log(`Sending email to: ${user.Email}`);
        }

        // Mark job as having sent newsletters
        job.newsLettersSent = true;
        await job.save();
      } catch (error) {
        console.error("ERROR IN NODE CRON CATCH BLOCK:", error);
      }
    }
  });
};



