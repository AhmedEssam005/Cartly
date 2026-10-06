const logger = require("./src/configs/logger.js");
const app = require("./src/app.js");


app.listen(process.env.PORT || 8000, () => {
	logger.info(`Server is running on port ${process.env.PORT || 8000}`);
});
