$(function(){
    var itemNum = 1;
   //create habit form behavior
   $("#submitButton").click(function(event){
      event.preventDefault();
      var item = $("#item").val().replace(/^\s+|\s+$/g, '');
      if(item == '') return;
      $("#item").val('');//clear input box

      var itemId = "item" + itemNum;
      var dataId = "data" + itemNum;

      $("#mylist").append("<p class='item' id='" + itemId+"'><b>" + item + "</b></p>");
      

      //do the query to get promotion
      var posting = $.post("/promotion/post_query", {query: item});
      posting.done(function( data ) {
          if(data.promotions.length == 0) return;
          
          $("#data").append("<div id='" + dataId + "'>");
          data.promotions.forEach(function(promotion){
              $("#"+dataId).append( "<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>" + promotion.supplier + ":&nbsp;&nbsp;</i>" + promotion.content + "</p>" );
          });
          //append show promotion to the item
          $("#"+itemId).append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a class='showPromotion' href='#'><img style='width: 2%; height: 2%' src='/image/sale.png'></a>"); 
      });
      itemNum++;
   });


   $(".showPromotion").click(function(event){
       alert('clicked');
   })
});