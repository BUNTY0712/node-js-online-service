import { CronJob } from 'cron';
import https from 'https';

const job = new CronJob('*/14 * * * *', function () {
	// Check if API_URL is set and valid
	if (!process.env.API_URL) {
		console.log('API_URL not set, skipping cron job ping');
		return;
	}

	console.log(`Sending keep-alive ping to: ${process.env.API_URL}`);

	https
		.get(process.env.API_URL, (res) => {
			if (res.statusCode === 200) {
				console.log('GET request sent successfully');
			} else {
				console.log('GET request failed', res.statusCode);
			}
		})
		.on('error', (e) => {
			console.error('Error while sending request', e.message);
			console.log(
				'This is normal if running locally - the cron job is for production deployment'
			);
		});
});

export default job;

// CRON JOB EXPLANATION:
// Cron jobs are scheduled tasks that run periodically at fixed intervals
// we want to send 1 GET request for every 14 minutes so that our api never gets inactive on Render.com

// How to define a "Schedule"?
// You define a schedule using a cron expression, which consists of 5 fields representing:

//! MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK

//? EXAMPLES && EXPLANATION:
//* 14 * * * * - Every 14 minutes
//* 0 0 * * 0 - At midnight on every Sunday
//* 30 3 15 * * - At 3:30 AM, on the 15th of every month
//* 0 0 1 1 * - At midnight, on January 1st
//* 0 * * * * - Every hour
