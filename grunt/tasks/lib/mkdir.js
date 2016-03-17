module.exports = {
	workspace: {
		options: {
			create: function() {
				console.log(grunt)
				return ['deploy', 'workspaces/projects', 'workspaces/visualizations']
			}
		},
	},
}