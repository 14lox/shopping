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
      var strip = itemNum % 2 == 0 ? "gray" : "white"

      $("#mylist").append("<p class='item " + strip +"' id='" + itemId+"'><b>" + item + "</b></p>");
      

      //do the query to get promotion
      var posting = $.post("/promotion/post_query", {query: item});
      posting.done(function( data ) {
          if(data.promotions.length == 0) return;
          
          $("#data").append("<div id='" + dataId + "'>");
          data.promotions.forEach(function(promotion){
              $("#"+dataId).append( "<p><i>" + promotion.supplier + ":&nbsp;&nbsp;</i>" + promotion.content + "</p>" );
          });
          //append show promotion to the item
          $("#"+itemId).append("<a class='showPromotion' href='#'><img src='/image/sale.png'></a>"); 
      });
      itemNum++;
   });

  $(document).on('click', '.showPromotion', function(){
    var itemId = this.parentElement.attributes["id"].value;
    var dataId = itemId.replace("item", "data");
    $("#dialog-modal").html($("#"+dataId).html());
    $( "#dialog-modal" ).dialog({
      height: 240,
      modal: true
    });
  })

});