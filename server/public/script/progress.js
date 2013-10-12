$(function(){

	var getDateString = function(date, offset){
		month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var realdate = new Date(new Date(date).getTime() + offset * 24*3600*1000);
		var mon = month_names_short[realdate.getMonth()];
		var day = realdate.getDate();
		return mon + ' ' + day;
	}

	var setTableContent = function(){
		 var size = $(window).width();
		 var row, column, content;
		 if(size > 760){ row= 3; column = 7}
		 else if(size > 580){ row= 4; column = 6}
		 else if(size > 520){ row= 5; column = 5}
		 else if(size > 420){ row=6; column = 4}
		 else {row=7; column=3;}

		 for(var i = 0; i < row; i++){
		 	content += '<tr>'
		 	for(var j=0; j<column; j++){
		 		if(i*column + j > 20) break;
		 		content += '<td class="calendarcell"><span class="days">' + getDateString($('#values').attr('startDate'),(i*column+j)) + '</span></td>'
		 	}
		 	content += '</tr>';
		 }
		 $(progress).html(content);
		 setEveryDayStatus();
	}

	var setEveryDayStatus = function(){
		var lasted = $('#values').attr('lasted');
		var cells = $('.calendarcell');
		for(var i=0; i < lasted; i++){
			$(cells[i]).append("<img src='/image/tick.png'/>");
		}

		var daysTillToday = getDaysTillToday();
		for(var i=lasted; i < daysTillToday && i < 21; i++){
			$(cells[i]).append("<img src='/image/cross.png'/>");
		}
		
	}

	var getDaysTillToday= function(){
		var startDate = $('#values').attr('startDate');
		var aday = 1000*60*60*24;
	    return Math.floor((Date.now() - (new Date(startDate)).valueOf())/aday);
	}



	setTableContent();

	$(window).resize(function() {
  		setTableContent();
	});

})

