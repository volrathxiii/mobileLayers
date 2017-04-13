/**
 *	Mobilelayer.model.js
 *	everything will start from here. :)
 */

(function (window) {
	// This should be immutable
	var Strata = function(){
		var _Strata;
		var defaultConfig = {
			'home_layer': 'ml-home',
			'auto_open': true,
			'auto_layer': 'auto-ml',
			'animation': {
				'time': 500
			},
			'header': {
				'enable': true,
				'template': '{{content}}',
				'class': 'ml-header'
			},
			'layer': {
				'template': '{{content}}',
				'class': 'ml-layer',
				'type': 'offcanvas',
				'position': 'right'
			},
			'parent': false
		};

		var config = {};

		var _plugins = {
			'controllers': {},
			'modules': {}
		};

		var _inited = false;

		var Initialize = function(type) {
			if(typeof _plugins[type] === 'object') {
				$.each(_plugins[type], function(name, obj){
					if(typeof obj.init === 'function') {
						obj.init(_Strata.config); //initialize controllers or modules
					}
				});
			}
		};

		var Initialization = function(userConfig) {
			if(_inited) return;
			
			_Strata.config = $.extend( defaultConfig , userConfig);
			console.log('Initializing', _Strata.config);
			Initialize('controllers');
			// Expose controllers to lower level
			$.each(_plugins.controllers, function(name, obj) {
				if(_Strata[ name ]) return; // fail if already in the namespace
				_Strata[ name ] = obj;
			});
			Initialize('modules');
			_inited = true;
		};

		_Strata = {
			'config': config,
			'modules': _plugins.modules,
			'controllers': _plugins.controllers,
			'init': Initialization
		};

		return _Strata;
	};

	window.Strata = Strata();
}(window));