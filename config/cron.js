import { CronJob } from 'cron';
import https from 'https';

const job = new CronJob(
	'0 */14 * * * *',
	function () {
		// Check if API_URL is set and valid
		if (!process.env.API_URL) {
			console.log('API_URL not set, skipping cron job ping');
			return;
		}

		console.log(
			`[${new Date().toISOString()}] Sending keep-alive ping to: ${
				process.env.API_URL
			}`
		);

		const url = new URL(process.env.API_URL);
		const options = {
			hostname: url.hostname,
			port: url.port || (url.protocol === 'https:' ? 443 : 80),
			path: url.pathname || '/',
			method: 'GET',
			timeout: 30000, // 30 second timeout
		};

		const req = https.request(options, (res) => {
			let data = '';
			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				if (res.statusCode === 200) {
					console.log(
						`[${new Date().toISOString()}] Keep-alive ping successful - Status: ${
							res.statusCode
						}`
					);
				} else {
					console.log(
						`[${new Date().toISOString()}] Keep-alive ping failed - Status: ${
							res.statusCode
						}`
					);
				}
			});
		});

		req.on('error', (e) => {
			console.error(
				`[${new Date().toISOString()}] Error while sending keep-alive request:`,
				e.message
			);
			console.log(
				'This is normal if running locally - the cron job is for production deployment'
			);
		});

		req.on('timeout', () => {
			console.log(`[${new Date().toISOString()}] Keep-alive request timed out`);
			req.destroy();
		});

		req.end();
	},
	null,
	false,
	'UTC'
);

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
