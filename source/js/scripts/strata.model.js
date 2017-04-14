/**
 *	Mobilelayer.model.js
 *	everything will start from here. :)
 */

(function (window) {
	// This should be immutable
	var Strata = function(){
		var _Strata;
		var defaultConfig = {
			'homeLayer': 'ml-home',
			'autoOpen': true,
			'autoLayer': 'auto-ml',
			'animation': {
				'time': 500
			},
			'header': {
				'enable': true,
				'template': '{{back}}{{title}}{{home}}',
				'class': 'ml-header',
				'title': false,
				'buttons': {
					'back': true,
					'home': true
				},
				'type': 'site' // site|layer
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

		// Modules
		var Modules = function() {

		};

		Modules.prototype.trigger = function(parameters){
			// controller|action|parameters
			var _this = this;
			$.each(_this, function(name, _module){
				if(_module[parameters.controller] && _module[parameters.controller][parameters.action]) {
					_module[parameters.controller][parameters.action]( parameters.parameters );
				}
			});
		};

		var _plugins = {
			'controllers': {},
			'modules': new Modules()
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
			Initialize('controllers');
			// Expose controllers to lower level
			$.each(_plugins.controllers, function(name, obj) {
				if(_Strata[ name ]) return; // fail if already in the namespace
				_Strata[ name ] = obj;
			});
			Initialize('modules');
			_inited = true;
		};

		var configAttributeParse = function(element) {
			var result = {};
			var attributes = getConfigAttributes(element);

			$.each(attributes, function(name, value){
				var configName = name.replace('config-','');
				var nameParts = configName.split('-');
				var nameWalk = "", nameWalkBroken = false;
				nameParts.map(function(nameKey){
					nameWalk += '["'+nameKey+'"]';
					if(!nameWalkBroken){
						if(eval('typeof _Strata.config'+nameWalk) === 'undefined') {
							nameWalkBroken = true;
						}else{
							if(eval('typeof result'+nameWalk) === 'undefined'){
								eval('result'+nameWalk+'={};');
							}
						}
					}
				});
				if(!nameWalkBroken) eval('result'+nameWalk+'=value;');
			});
			return result;
		};

		var getConfigAttributes = function(element) {
			// get attrubutes of the first element
			if(typeof element !== 'object' ) return false;

			var _result = {};
			$.each(element[0].attributes, function(dataKey, dataValue){
				if(String(dataValue.name).indexOf('config-') >= 0){
					_result[dataValue.name] = dataValue.value;
				}
			});
			return _result;
		};

		var getElementConfig = function(element) {
			var result = {};
			var configElement = element.find('.ml-config');
			if(configElement.length) {
				$.each(configElement, function(){
					result = $.extend(true, result, getConfigAttributes($(this)));
				});
			}

			return result;
		};

		_Strata = {
			'config': config,
			'modules': _plugins.modules,
			'controllers': _plugins.controllers,
			'getConfigAttributes': getConfigAttributes,
			'getElementConfig': getElementConfig,
			'configAttributeParse': configAttributeParse,
			'init': Initialization
		};

		return _Strata;
	};

	window.Strata = Strata();
}(window));