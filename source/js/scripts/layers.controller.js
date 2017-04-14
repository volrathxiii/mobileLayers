/**
 *	LayersController
 *  Holds all layers
 */
(function (Strata) {
	// var layerslist = {};
	var HTML = $('html');

	var LayersController = function() {
		var _inited = false;
		var list = {};
		// var _controller = $(this);
		// this.list = list;

		// stores history of opened layers
		// why? because we want to track where is our layer being opened
		// from so that we can open back this will be helpful if we want a global header
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

		// getOpened based on history
		var getOpened = function() {
			// var result = false;
			// $.each(list, function(layerID,layer){
			// 	if(layer.opened) {
			// 		result = layer;
			// 	}
			// });
			// return result;

			return history[ history.length - 1 ];
		};

		var getLast = function() {
			// var result = false;
			// $.each(list, function(layerID,layer){
			// 	if(layer.last) {
			// 		result = layer;
			// 	}
			// });
			// return result;
			return history[ history.length - 2 ];
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

		var openLayer = function(id) {
			if(get(id)) {
				var LastLayer = getOpened();
				if(LastLayer) LastLayer.setLast(LastLayer.id);

				// set direction
				if(list[id].element.hasClass('ml-opened')) {
					HTML.removeClass('ml-next').addClass('ml-back');
					getOpened().element.removeClass('ml-opened');
					history.pop();
				}else{
					HTML.removeClass('ml-back').addClass('ml-next');
					history.push( list[ id ] );
					list[ id ].element.addClass('ml-opened');
				}
				// $('html').removeClass('ml-previous').addClass('ml-next');
				// set last layercontroller
				setActive(id);
				moduleTrigger('openLayerStart',{'layer': list[ id ]});
				list[ id ].open();
				moduleTrigger('openLayerEnd',{'layer': list[ id ]});
			}
		};

		// closes active layer, do back
		var closeLayer = function() {
			var activeLayer = getOpened();
			var lastLayer = getLast();
			
			if(activeLayer && lastLayer) {
				// $('html').removeClass('ml-next').addClass('ml-previous');
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
				// var newLayer = new Strata.layer(options);
				// newLayer.create($(this));
				// add(newLayer);
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

			// add option to back into specific layer by triggering ml-open
			$(document).on('click', '.ml-close', function(e){
				e.stopPropagation();
				e.preventDefault();
				closeLayer();
			});

			moduleTrigger('attachListers',{});
		};

		var init = function(options) {
			if(_inited) return;
			
			// initialize domTree
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
			'closeLayer': closeLayer,
			'setActive': setActive,
			'autoLayers': autoLayers
		};
	};

	// listController.prototype.setOpened = function(listID) {
	// 	var LastItem = getOpened();
	// 	console.log(LastItem);
	// 	if(LastItem) LastItem.opened = false;

	// 	this.list[listID].opened = true;
	// };


	Strata.controllers.layers = new LayersController();
}(Strata));