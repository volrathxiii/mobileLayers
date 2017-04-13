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

		var add = function(element, options) {
			console.log('add', element,options)
			if((typeof element !== 'string' && typeof element !== 'object') || typeof options !== 'object') return;
			var newLayer = new Strata.controllers.layer(options);
			newLayer.create(element);

			list[newLayer.id] = newLayer;
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
				list[ id ].open();
			}
		};

		// closes active layer, do back
		var closeLayer = function() {
			var activeLayer = getOpened();
			var lastLayer = getLast();
			
			if(activeLayer && lastLayer) {
				// $('html').removeClass('ml-next').addClass('ml-previous');
				activeLayer.element.removeClass('ml-opened');
				openLayer(lastLayer.id);
			}
		};

		var autoLayers = function(options) {
			if(typeof options === 'undefined') options = userConfig;
			
			if(!options.auto_layer) return false;
			var _this = $(this);
			$('.'+options.auto_layer).each(function(){
				// var newLayer = new Strata.layer(options);
				// newLayer.create($(this));
				// add(newLayer);
				console.log('autolayers', _this.add);	
				add($(this), options);
			});
		};

		var _setupDOMTree = function(options){
			if(typeof options === 'undefined') options = Strata.config;
			var _body; 
			_body = $('body');

			console.log(options);
			var fadeInClass = 'ml-' + Strata.config.layer.type +'-'+ Strata.config.layer.position;
			var typeClass = 'ml-' + Strata.config.layer.type;

			var homeLayer = $('<div>', {'class':'ml-home '+fadeInClass+' '+typeClass, 'id': 'ml-home'}).html(options.layer.template.replace('{{content}}', _body.html()));
			homeLayer.find('script').remove();
			options.parent = $('<div>',{'class':'ml-site-wrapper'}).html(homeLayer);

			$('body').children().not('script').remove();
			$('body').prepend(options.parent);

			$('html').addClass('ml-inited');
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
		};

		var init = function(options) {
			if(_inited) return;
			
			// initialize domTree
			_setupDOMTree(options);

			add('#'+options.home_layer, options);

			autoLayers(options);

			openLayer(options.home_layer);

			_attachListeners();

			_inited = true;
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