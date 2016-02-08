module.exports = {
	options: {
		cors: true,
		port: 8000,
		nevercache: true,
		logRequests: true
	},
	foo: 'bar' // For some reason an extra key with a non-object value is necessary 
}