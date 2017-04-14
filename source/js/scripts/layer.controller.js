/**
 *	Layers
 */

(function (Strata) {
	// var __mLayersList = __mLayersList || {};

	var _opened = false;

	// Helpers
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

		// get or set ID
		var elementId = element.attr('id');
		if(elementId === 'undefined') elementId = GenerateID('mlayer');
		this.id = elementId;

		// get element attributes then set as config here
		var elementConfig = Strata.configAttributeParse(element);
		this.config = $.extend(true,this.config,elementConfig);

		moduleTrigger('createStart',{'element':element});
		this.config.parent.trigger('createLayerStart', element);

		// if(typeof __mLayersList[this.id] === 'object') return;
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
		// __mLayersList[this.id] = this;
	};

	// setActive
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

	// set active layer as opened
	LayerController.prototype.setOpened = function() {
		var current = Strata.controllers.layers.getOpened();
		if(typeof current === 'object') current.opened = false;
		// Strata.controllers.layers.getOpened().opened = false;
		this.opened = true;
		_opened = this.id;
		moduleTrigger('setOpened',{'layer':this});
	};

	// set as last item opened
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

	LayerController.prototype.open = function() {
		var _this = this;
		if(_opened === _this.id) return; // dont do anything if layer is current opened and active
		// set html class for basis of animating
		$('html').removeClass('ml-offcanvas ml-popup ml-split').addClass('ml-'+_this.config.layer.type);

		// close opened panel
		// if(typeof __mLayersList[ _opened ] === 'object') {
		// 	__mLayersList[ _opened ].close();
		// }
		// var last = Strata.controllers.layers.getLast();
		// console.error('error', last);
		// if(last && last.id !== _this.id) last.close();

		// set opened
		// _opened = _this.id;

		this.setOpened();
		this.setActive(this.id);

		// do reset first
		// @TODO Move to private function
		// @TODO can now be removed
		// $('html').addClass('ml-reset');
		// setTimeout(function(){
		// 	$('html').removeClass('ml-reset').addClass('ml-opening');
		// },1);
		moduleTrigger('openStart',{'layer':this});
		_this.element.trigger('openStart', _this);
		_this.element.removeClass('ml-last').addClass('ml-target ml-opening');

		setTimeout(function(){
			_this.element.removeClass('ml-target ml-opening');
			moduleTrigger('openEnd',{'layer':_this});
			_this.element.trigger('openEnd', _this);
			// $('html').removeClass('ml-opening').addClass('ml-opened');
		},_this.config.animation.time);
	};

	// var REMOVEALLLASTOPENEDITEMS = function(){
	// 	$.each(__mLayersList, function(e,item){
	// 		item.element.removeClass('ml-last');
	// 	});
	// };

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