/**
 * Initialization
 */

var mLayers = new MobileLayers();

$( document ).ready(function() {
	// listeners
	$(document).on('click', '.mlayer-next', function(e){
		var toggler = $(this);
		var target = toggler.attr('href') || toggler.attr('data-target');
		target = target.replace('#','');
		if(typeof target !== 'string') return;
		var targetLayer = mLayers.getLayer(target);
		if(targetLayer) {
			e.stopPropagation();
			e.preventDefault();
			mLayers.next(target);
		}
	});

	$(document).on('click', '.mlayer-previous', function(e){
		e.stopPropagation();
		e.preventDefault();
		mLayers.back();
	});
});