/** 
 *	mobileLayers (mLayers)
 */
(function (window) {

	__default_options = {
		'home_layer': '#ml-home',
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

	var __user_options;
	var __inited = false;

	window.__mLayersList = {}; // global list for all layers
	window.__mLayersHistory = []; // global list traversed history

	// controller prototype
	var LayersController = function () {

		//setup html + body
		var SETUPDOM = function(options){
			if(typeof options === 'undefined') options = __user_options;
			var _body; 
			_body = $('body');

			var homeLayer = $('<div>', {'class':'ml-home', 'id': 'ml-home'}).html(options.layer.template.replace('{{content}}', _body.html()));
			homeLayer.find('script').remove();
			options.parent = $('<div>',{'class':'ml-site-wrapper'}).html(homeLayer);

			$('body').children().not('script').remove();
			$('body').prepend(options.parent);

			$('html').addClass('ml-inited');
		};

		var AUTOLAYER = function(options){
			if(typeof options === 'undefined') options = __user_options;
			if(!options.auto_layer) return false;
			$('.'+options.auto_layer).each(function(){
				var newLayer = new MobileLayer(options);
				newLayer.create($(this));
				ADDLAYER(newLayer);
			});
		};

		var ADDLAYER = function(layer){
			if(typeof __mLayersList[layer.id] === 'object') return false;
			__mLayersList[layer.id] = layer;
		};

		var RESETPRIORITY = function() {
			$('.ml-last').removeClass('ml-last');
		};

		var SETOPENEDLAYERS = function() {
			$('.ml-opened').removeClass('ml-opened');
			$.each(__mLayersHistory, function(key,layer) {
				layer.element.addClass('ml-opened');
			});
		};

		this.init = function(options) {
			if(typeof options !== 'object') options = {};
			if(__inited) return false; // fail silently if already inited
			__user_options = $.extend( __default_options , options);

			SETUPDOM(__user_options);
			// create first layer based on body
			var HomeLayer = new MobileLayer( __user_options );
			HomeLayer.create(__user_options.home_layer);
			ADDLAYER(HomeLayer);

			AUTOLAYER(__user_options);

			HomeLayer.open();
			__mLayersHistory.push(HomeLayer);

			__inited = true;
		};

		this.list = __mLayersList;

		this.getLayer = function(elementID) {
			if(typeof __mLayersList[elementID] !== 'object') return false;
			return __mLayersList[elementID];
		};

		this.openLayer = function(elementID) {
			if(typeof __mLayersList[elementID] !== 'object') return;
			__mLayersList[elementID].open();
		};

		this.closeLayer = function(elementID) {
			if(typeof __mLayersList[elementID] !== 'object') return;
			__mLayersList[elementID].close();
		};

		this.next = function(elementID) {
			if(typeof __mLayersList[elementID] !== 'object') return;
			$('html').removeClass('ml-previous').addClass('ml-next');
			RESETPRIORITY();
			var last_item = __mLayersHistory[ __mLayersHistory.length - 1 ];
			if(last_item) last_item.element.addClass('ml-last');
			__mLayersHistory.push(__mLayersList[elementID]);
			__mLayersList[elementID].open();
			SETOPENEDLAYERS();
		};

		this.back = function() {
			$('html').removeClass('ml-next').addClass('ml-previous');
			RESETPRIORITY();
			var last_item = __mLayersHistory[ __mLayersHistory.length - 1 ];
			if(last_item) {
				last_item.close();
				last_item.element.addClass('ml-last');
				__mLayersHistory.pop();
			}
			
			__mLayersHistory[ __mLayersHistory.length - 1 ].open();
			SETOPENEDLAYERS();
		};
	};
	
	window.MobileLayers = LayersController;

}(window));