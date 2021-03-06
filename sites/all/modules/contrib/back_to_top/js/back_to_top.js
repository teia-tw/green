(function ($) {
	Drupal.behaviors.backtotop = {
		attach: function(context) {
			var exist= jQuery('#backtotop').length;
      if(exist == 0) {
        $("body").append("<div id='backtotop'>"+Drupal.t("<span class='backtotop-wrapper'>&uarr;</span> TOP")+"</div>");
      }
			$(window).scroll(function() {
				if ($.browser.msie && parseInt($.browser.version) < 9) {
					if($(this).scrollTop() > Drupal.settings.back_to_top.back_to_top_button_trigger) {
						$('#backtotop').show();	
					} else {
						$('#backtotop').hide();
					}
				}
				else {
					if($(this).scrollTop() > Drupal.settings.back_to_top.back_to_top_button_trigger) {
						$('#backtotop').fadeIn();	
					} else {
						$('#backtotop').fadeOut();
					}
				}
			});

			$('#backtotop').click(function() {
				$('body,html').animate({scrollTop:0},1200,'easeOutQuart');
			});	
		}
	};
})(jQuery);