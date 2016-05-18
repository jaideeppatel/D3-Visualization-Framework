# CNS-Frontend-Visualization-Framework
This framework contains a set of workflows, configurations, and tools to simplify web visualization creation and customization for CNS projects. This was made primarily for [D3js] visualizations, but can be used to create non-[D3js] visualizations with minimal modification. This framework is used in conjunction with the plugin repository (TODO: Link here). 

## Goal
Web visualization projects use quite a bit of similar code, and it can get pretty messy. Often these visualizations do not need to be completely rewritten for each application, but without a framework, it is easy to lock down the code for the particular application. This framework with the plugins provide generalized underlying visualizations that have methods to add layers of customization and standard methods to create.

Additionally, these visualizations need to be accessed and improved by people who may not know how to code, and quickly. The configuration objects and methods are made to extract most of the configurable options from the underlying code where they can be easily and safely modified. 

We plan to grow our plugin library to cover many standard use cases that can be applied to non-standard needs. This allows us to cut down preliminary development time and spend more time customizing and improving the solution.

### Version
0.0.0
### Technologies
Many web libraries are used to make this project function:

* [AngularJS]
* [Twitter Bootstrap]
* [node.js]
* [jQuery]
* [Head.js]
* [D3js]

### Installation

First, check out this project. Duh.

You need npm, grunt, and git installed globally:
* Git can be installed from: https://git-scm.com/download/win
* NPM can be installed from: https://docs.npmjs.com/getting-started/installing-node
* Grunt can be installed with NPM: 
*  ```sh
   > npm install grunt
   ```

After grunt, npm, and git have been installed and added to your system's path:

* Open a command prompt/terminal 
* Navigate to the project directory (which include Gruntfile.js)
* in your prompt, enter:
*  ```sh
   > grunt sometask --arg1=Opt1
   ```
* Grunt will notify you of any missing dependencies or errors parsing the scripts. 
    *   To install dependencies from the Grunt package.json file, run the following command:
    *  ```sh
        > npm install --save
        ```   
    * To update the Grunt package.json file, run the following command:
    * ```sh
        > npm update --save
        ```        

The following code is used to access a simple UI for running pre-bundled grunt tasks. Enter this in your prompt, and follow the instructions given.
```sh
> grunt prompt
```






### Development

For now, this framework may be freely modified. Please fork this repository and submit a pull request with any structural changes. Also please respect the structure of this framework. Do not include data, project-specific configurations, or plugins to this repository. 

### TODOs

 - Add test cases for contribution
 - Improve Grunt build
 - Solidify framework structure

License
----



[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [D3js]: <https://d3js.org/>
   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [john gruber]: <http://daringfireball.net>
   [@thomasfuchs]: <http://twitter.com/thomasfuchs>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [marked]: <https://github.com/chjj/marked>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [keymaster.js]: <https://github.com/madrobby/keymaster>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>
   [Head.js]: <http://headjs.com>
   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]:  <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
