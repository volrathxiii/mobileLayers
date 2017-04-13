/**
 *	LayersController
 *  Holds all layers
 */
(function (window) {
	// var layerslist = {};
	var HTML = $('html');
	var LayersController = function() {
		this.list = {};

		// stores history of opened layers
		// why? because we want to track where is our layer being opened
		// from so that we can open back this will be helpful if we want a global header
		this.history = []; 

		this.add = function(element, options) {
			if((typeof element !== 'string' && typeof element !== 'object') || typeof options !== 'object') return;
			var newLayer = new LayerController(options);
			newLayer.create(element);

			this.list[newLayer.id] = newLayer;
		};

		this.get = function(id) {
			return this.list[id];
		};

		// getOpened based on history
		this.getOpened = function() {
			// var result = false;
			// $.each(this.list, function(layerID,layer){
			// 	if(layer.opened) {
			// 		result = layer;
			// 	}
			// });
			// return result;

			return this.history[ this.history.length - 1 ];
		};

		this.getLast = function() {
			// var result = false;
			// $.each(this.list, function(layerID,layer){
			// 	if(layer.last) {
			// 		result = layer;
			// 	}
			// });
			// return result;
			return this.history[ this.history.length - 2 ];
		};

		this.setActive = function(id) {
			$.each(this.list, function(layerID,layer){
				if(layerID === id) {
					layer.element.addClass('ml-active');
				} else {
					layer.element.removeClass('ml-active');
				}
			});
		};

		this.openLayer = function(id) {
			if(this.get(id)) {
				// set direction
				if(this.list[id].element.hasClass('ml-opened')) {
					HTML.removeClass('ml-next').addClass('ml-back');
					this.getOpened().element.removeClass('ml-opened');
					this.history.pop();
				}else{
					HTML.removeClass('ml-back').addClass('ml-next');
					this.history.push( this.list[ id ] );
					this.list[ id ].element.addClass('ml-opened');
				}
				// $('html').removeClass('ml-previous').addClass('ml-next');
				this.setActive(id);
				this.list[ id ].open();
				
			}
		};

		// closes active layer, do back
		this.closeLayer = function() {
			var activeLayer = this.getOpened();
			var lastLayer = this.getLast();
			
			if(activeLayer && lastLayer) {
				// $('html').removeClass('ml-next').addClass('ml-previous');
				activeLayer.element.removeClass('ml-opened');
				this.openLayer(lastLayer.id);
				
			}
		};
	};

	// this.listController.prototype.setOpened = function(listID) {
	// 	var LastItem = this.getOpened();
	// 	console.log(LastItem);
	// 	if(LastItem) LastItem.opened = false;

	// 	this.list[listID].opened = true;
	// };



	window.LayersController = new LayersController();
}(window));