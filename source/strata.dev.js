/*!
 * Branch: master
 * Commit: #dd04322
 * Date: Thu Apr 20 2017 00:47:29 GMT+0800 (+08)
 */
(function (window) {
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
					'left': 'backButton("Back")',
					'right': 'openButton("#ml-home","Home")'
				},
				'type': 'site' 
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

		var Modules = function() {

		};

		Modules.prototype.trigger = function(parameters){
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
						obj.init(_Strata.config); 
					}
				});
			}
		};

		var Initialization = function(userConfig) {
			if(_inited) return;
			_Strata.config = $.extend( defaultConfig , userConfig);
			Initialize('controllers');
			$.each(_plugins.controllers, function(name, obj) {
				if(_Strata[ name ]) return; 
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
(function (Strata) {
	var _opened = false;

	var GenerateID = function(prefix) {
		return prefix+'_'+Math.round(new Date().getTime() + (Math.random() * 100000));
	};

	var LayerException = function(message) {
		this.message = message;
		this.name = 'LayerException';
	};

	var LayerController = function(config) {
		if(typeof config !== 'object') return false;
		var _config = $.extend(true, {}, config);

		this.id = false;
		this.element = false;
		this.active = false;
		this.opened = false;
		this.last = false;
		this.config = _config;
	};

	var moduleTrigger = function(action, parameters) {
		Strata.modules.trigger({'controller':'layer','action':action,'parameters': parameters});
	};

	LayerController.prototype.create = function(element) {
		if(this.id !== false) return;
		if(typeof element === 'string') {
			var targetElement = $(element);
			if(targetElement.length < 1) throw new LayerException('Invalid object id:'+ element);
			element = targetElement;
		}

		if(element.length < 0) throw new LayerException('Invalid object:'+ element);

		var elementId = element.attr('id');
		if(elementId === 'undefined') elementId = GenerateID('mlayer');
		this.id = elementId;

		var elementConfig = Strata.configAttributeParse(element);
		this.config = $.extend(true,this.config,elementConfig);

		moduleTrigger('createStart',{'element':element});
		this.config.parent.trigger('createLayerStart', element);

		var fadeInClass = 'ml-' + this.config.layer.type +'-'+ this.config.layer.position;
		var typeClass = 'ml-' + this.config.layer.type;

		var newLayerContent = $('<div>', {'class':'ml-layer-content'}).html(this.config.layer.template.replace('{{content}}', element.html()));

		var newLayerContainer = $('<div>', {'class':'ml-layer-container'}).html(newLayerContent);

		var newLayer = $('<div>', {
			'class':'ml-layer '+ element.attr('class')+ ' '+typeClass+' ' +fadeInClass, 
			'id': this.id
		}).html(newLayerContainer);

		element.remove();

		this.element = newLayer;
		this.config.parent.append(this.element);

		moduleTrigger('createEnd',{'layer':this});
		this.config.parent.trigger('createLayerEnd', this);
	};

	LayerController.prototype.resetState = function() {
		this.active = false;
		this.opened = false;
		this.last = false;
	};

	LayerController.prototype.setActive = function(id) {
		$.each(Strata.controllers.layers.list, function(layerID, layer) {
			if(layerID === id) {
				layer.active = true;
				moduleTrigger('setActive',{'layer':layer});
			} else {
				layer.active = false;
			}
		});
	};

	LayerController.prototype.setOpened = function() {
		var current = Strata.controllers.layers.getOpened();
		if(typeof current === 'object') current.opened = false;
		this.opened = true;
		_opened = this.id;
		moduleTrigger('setOpened',{'layer':this});
	};

	LayerController.prototype.setLast = function(id) {
		if(typeof id === 'undefined') id = this.id;
		$.each(Strata.controllers.layers.list, function(layerID, layer) {
			if(layerID === id) {
				layer.last = true;
				moduleTrigger('setLast',{'layer':layer});
			} else {
				layer.last = false;
			}
		});
	};

	var triggerBlocker = function(layer) {
		Strata.config.parent.find('.ml-blocker').remove();
		$('html').removeClass('ml-blocker-opened');
		if(layer.config.layer.type === 'split' || layer.config.layer.type === 'popup') {
			$('html').addClass('ml-blocker-opened');
			var $blocker = $('<div>', {'class':'ml-blocker'});
			$blocker.insertAfter(layer.element);

			$blocker.off('click').on('click', function(e){
				Strata.layers.closeLayer();
			});
			moduleTrigger('openBlocker',{'layer':layer});
		}
	};

	LayerController.prototype.open = function() {
		var _this = this;
		if(_opened === _this.id) return; 
		$('html').removeClass('ml-offcanvas ml-popup ml-split').addClass('ml-'+_this.config.layer.type);

		triggerBlocker(_this);

		this.setOpened();
		this.setActive(this.id);

		moduleTrigger('openStart',{'layer':this});
		_this.element.trigger('openStart', _this);
		_this.element.addClass('ml-target ml-opening');

		setTimeout(function(){
			_this.element.removeClass('ml-target ml-opening');
			moduleTrigger('openEnd',{'layer':_this});
			_this.element.trigger('openEnd', _this);
		},_this.config.animation.time);
	};

	LayerController.prototype.close = function() {
		var _this = this;
		moduleTrigger('closeStart',{'layer':this});
		_this.element.trigger('beforeClose', _this);
		_this.element.removeClass('ml-active').addClass('ml-closing');

		setTimeout(function(){
			_this.element.removeClass('ml-closing');
			_this.setLast();
			moduleTrigger('closeEnd',{'layer':_this});
			_this.element.trigger('closeEnd', _this);
		},_this.config.animation.time);
	};

	Strata.controllers.layer = LayerController;

}(Strata));
(function (Strata) {
	var HTML = $('html');

	var LayersController = function() {
		var _inited = false;
		var list = {};
		var history = [];

		var moduleTrigger = function(action, parameters) {
			Strata.modules.trigger({'controller':'layers','action':action,'parameters': parameters});
		};

		var add = function(element, options) {
			if((typeof element !== 'string' && typeof element !== 'object') || typeof options !== 'object') return;
			var newLayer = new Strata.controllers.layer(options);
			newLayer.create(element);

			list[newLayer.id] = newLayer;
			moduleTrigger('add',{'layer': list[newLayer.id]});
		};

		var get = function(id) {
			return list[id];
		};

		var getOpened = function() {
			return history[ history.length - 1 ];
		};

		var getLast = function() {
			return history[ history.length - 2 ];
		};

		var getLastByElement = function() {
			var lastElement = Strata.config.parent.find('.ml-layer.ml-last');
			return get(lastElement.attr('id'));
		};

		var setLastActive = function() {
			$.each(list, function(layerID,layer){
				if(layer.last) {
					layer.element.addClass('ml-last');
					moduleTrigger('setLastActive',{'layer': layer});
				} else {
					layer.element.removeClass('ml-last');
				}
			});
		};

		var setActive = function(id) {
			$.each(list, function(layerID,layer){
				if(layerID === id) {
					layer.element.addClass('ml-active');
					moduleTrigger('setActive',{'layer': layer});
				} else {
					layer.element.removeClass('ml-active');
				}
			});
		};

		var _deletePreviousLayersHistory = function(targetLayer) {
			var found = false, hindex = false;
			$.each(history, function(hid, layer) {
				if(found === false && targetLayer === layer.id) {
					found = true;
					hindex = hid + 1;
				}
				if(found && targetLayer !== layer.id) {
					list[layer.id].element.removeClass('ml-opened');
					list[layer.id].resetState();
				}
			});
			if(hindex !== false) {
				history.splice(hindex, history.length);
			}
		};

		var openLayer = function(id) {
			if(get(id)) {
				var LastLayer = getOpened();

				if(list[id].element.hasClass('ml-opened')) {
					HTML.removeClass('ml-next').addClass('ml-back');
					getOpened().element.removeClass('ml-opened');
					_deletePreviousLayersHistory(id);

				}else{
					HTML.removeClass('ml-back').addClass('ml-next');
					history.push( list[ id ] );
					list[ id ].element.addClass('ml-opened');
				}

				if(LastLayer) LastLayer.setLast(LastLayer.id);
				setActive(id);
				moduleTrigger('openLayerStart',{'layer': list[ id ]});
				list[ id ].open();
				setLastActive();
				moduleTrigger('openLayerEnd',{'layer': list[ id ]});
			}
		};

		var tailLayer = function() {
			var activeLayer = getOpened();
			var lastLayer = getLast();

						if(activeLayer && lastLayer) {
				activeLayer.element.removeClass('ml-opened');
				moduleTrigger('closeLayerStart',{'layer': activeLayer});
				openLayer(lastLayer.id);
				moduleTrigger('closeLayerEnd',{'layer': activeLayer});
			}
		};

		var closeLayer = function() {
			var activeLayer = getOpened();
			var lastLayer = getLastByElement();

						if(activeLayer && lastLayer) {
				activeLayer.element.removeClass('ml-opened');
				moduleTrigger('closeLayerStart',{'layer': activeLayer});
				openLayer(lastLayer.id);
				moduleTrigger('closeLayerEnd',{'layer': activeLayer});
			}
		};

		var autoLayers = function(options) {
			if(typeof options === 'undefined') options = userConfig;

						if(!options.autoLayer) return false;
			var _this = $(this);
			$('.'+options.autoLayer).each(function(){
				add($(this), options);
				moduleTrigger('autoLayers',{'element': $(this), 'options': options});
			});
		};

		var _setupDOMTree = function(options){
			if(typeof options === 'undefined') options = Strata.config;
			var _body; 
			_body = $('body');

			var fadeInClass = 'ml-' + Strata.config.layer.type +'-'+ Strata.config.layer.position;
			var typeClass = 'ml-' + Strata.config.layer.type;

			var homeLayer = $('<div>', {'class':'ml-home '+fadeInClass+' '+typeClass, 'id': 'ml-home'}).html(options.layer.template.replace('{{content}}', _body.html()));
			homeLayer.find('script').remove();
			options.parent = $('<div>',{'class':'ml-site-wrapper'}).html(homeLayer);

			$('body').children().not('script').remove();
			$('body').prepend(options.parent);

			$('html').addClass('ml-inited');
			moduleTrigger('setupDOM',{'options': options});
		};

		var _attachListeners = function(){
			$(document).on('click', '.ml-open', function(e){
				var toggler = $(this);
				var target = toggler.attr('href') || toggler.attr('data-target');
				target = target.replace('#','');
				if(typeof target !== 'string') return;
				var targetLayer = get(target);
				if(targetLayer) {
					e.stopPropagation();
					e.preventDefault();
					openLayer(target);
				}
			});

			$(document).on('click', '.ml-tail', function(e){
				e.stopPropagation();
				e.preventDefault();
				tailLayer();
			});

			$(document).on('click', '.ml-close', function(e){
				e.stopPropagation();
				e.preventDefault();
				closeLayer();
			});

			moduleTrigger('attachListers',{});
		};

		var init = function(options) {
			if(_inited) return;

			_setupDOMTree(options);

			add('#ml-home', options);

			if(options.homeLayer !== 'ml-home') {
				get('ml-home').element.addClass('ml-opened');
			}

			autoLayers(options);

			openLayer(options.homeLayer);

			_attachListeners();

			_inited = true;
			moduleTrigger('init',{'options': options});
		};

		return {
			'add': add,
			'list': list,
			'history': history,
			'init': init,
			'get': get,
			'getOpened':  getOpened,
			'getLast': getLast,
			'openLayer': openLayer,
			'tailLayer': tailLayer,
			'closeLayer': closeLayer,
			'setActive': setActive,
			'autoLayers': autoLayers
		};
	};

	Strata.controllers.layers = new LayersController();
}(Strata));
(function(Strata){
	Strata.modules.Footer = {
		'init': function(config){
			console.log('Module footer', config);
		}
	};
}(Strata));
(function(Strata){
	var _siteHeaderInited = false, $HTML = $('html'), siteHeader;
	var createTitle = function(layer,config) {
		var title = config.title;
		if(!title) title = layer.id;
		return "<div class='ml-title' data-layer='"+layer.id+"'>"+title+"</div>";
	};
	var addHeaderTitle = function(layer, config){
		if(config.type === 'site'){
			var title = "<div class='ml-title' data-layer='"+layer.id+"'>"+config.title+"</div>";
			Strata.config.parent.find('.ml-header-site .ml-title-container').append(createTitle(layer, config));
		}
	};

	var backButton = function(text) {
		return $('<a>', {'class':'ml-button ml-close','href':'javascript:void(0)'}).html(text);
	};

	var openButton = function(link,text) {
		return $('<a>', {'class':'ml-button ml-open','href':link}).html(text);
	};

	var createHeader = function(layer, config, type) {
		var template = "<div class='ml-header ml-header-"+type+"'>"+config.template+"</div>";

		var titleWrapper, back, home;

		var backbutton = "<div class='ml-buttons ml-buttons-left'></div>";
		template = template.replace('{{back}}', backbutton);

		var homeButton = "<div class='ml-buttons ml-buttons-right'></div>";
		template = template.replace('{{home}}', homeButton);

		var title = config.title;
		if(!config.title) {
			title = layer.id;
		}

				titleWrapper = "<div class='ml-title-container'>"+createTitle(layer, config)+"</div>";

				template = template.replace('{{title}}', titleWrapper);

		return template;
	};

	var getAvailableElementConfig = function(elementConfig, itemConfig){
		if(elementConfig['config-header-title']) itemConfig.title = elementConfig['config-header-title'];
		if(elementConfig['config-header-buttons-right']) itemConfig.buttons.right = elementConfig['config-header-buttons-right'];
		if(elementConfig['config-header-buttons-left']) itemConfig.buttons.left = elementConfig['config-header-buttons-left'];
		return itemConfig;
	};

	Strata.modules.header = {
		'layer': {
			'createEnd': function(params) {
				var layer = params.layer;
				var headerConfig = layer.config.header;
				if(!headerConfig.enable) return;

				var elementConfig = Strata.getElementConfig(layer.element);
				var newConfig = getAvailableElementConfig(elementConfig, headerConfig);

								if(newConfig.type === 'site') {
					if(_siteHeaderInited) {
						addHeaderTitle(layer,newConfig);
					} else {
						Strata.config.parent.prepend(createHeader(layer,newConfig,'site'));
						_siteHeaderInited = true;
					}
					layer.element.addClass('ml-header-enabled');
				} else {
					layer.element.prepend(createHeader(layer,newConfig,'layer'));
					layer.element.addClass('ml-has-header');
				}
			},
			'openStart': function(Layer) {
				Layer = Layer.layer;
				var headerRight, headerLeft;

				if(Layer.config.header.type === 'layer') {
					$HTML.removeClass('ml-header-opened');
					headerRight = Layer.element.find('.ml-header-layer .ml-buttons-right');
					headerLeft = Layer.element.find('.ml-header-layer .ml-buttons-left');
				} else {
					$HTML.addClass('ml-header-opened');
					var $SiteHeader = Strata.config.parent.find('.ml-header-site');
					var lastTitle = $SiteHeader.find('.ml-title.ml-title-active');

					$SiteHeader.find('.ml-title').each(function(e,elem){
						if(Layer.id === $(this).attr('data-layer')) {
							$(this).addClass('ml-title-active').removeClass('ml-title-opened');
						}else{
							$(this).removeClass('ml-title-active');
						}
					});

					if(lastTitle && $HTML.is('.ml-next')) lastTitle.addClass('ml-title-opened');

					if(Layer.id === Strata.config.homeLayer) {
						$SiteHeader.addClass('ml-header-home');
					} else {
						$SiteHeader.removeClass('ml-header-home');
					}
					headerRight = $SiteHeader.find('.ml-buttons-right');
					headerLeft = $SiteHeader.find('.ml-buttons-left');
				}

				headerLeft.html('');
				headerRight.html('');
				var leftButton = '', rightButton = '';
				if(Layer.config.header.buttons.left != 'false') {
					console.error('buttons', headerLeft);
					leftButton = eval(Layer.config.header.buttons.left);
					headerLeft.html(leftButton);
				}

				if(Layer.config.header.buttons.right != 'false') {
					rightButton = eval(Layer.config.header.buttons.right);
					headerRight.html(rightButton);
				}
			}
		},
		'init': function(config){
			console.log('Module header', config);
		}
	};
}(Strata));
