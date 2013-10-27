$(function(){
    var itemNum;
    
    //create habit form behavior
   $("#submitButton").click(function(event){
      event.preventDefault();
      var item = $("#item").val().replace(/^\s+|\s+$/g, '');
      if(item == '') return;
      $("#item").val('');//clear input box
      itemNum++;
      localStorage.setItem("itemNum", itemNum);

      var itemId = "item" + itemNum;
      var dataId = "data" + itemNum;
      var strip = itemNum % 2 == 0 ? "gray" : "white"

      var para = $('<p>' + item + '</p>').attr( {"class": strip + ' item', id: itemId});
      $("#mylist").append(para);
      localStorage.setItem(itemId, item);

      //do the query to get promotion
      var posting = $.post("/promotion/post_query", {query: item});
      posting.done(function( data ) {
          if(data.promotions.length == 0) return;
          localStorage.setItem(dataId, JSON.stringify(data));
          $("#data").append("<div id='" + dataId + "'>");
          data.promotions.forEach(function(promotion){
              $("#"+dataId).append( "<p><i>" + promotion.supplier + ":&nbsp;&nbsp;</i>" + promotion.content + "</p>" );
          });
          //append show promotion to the item
          $("#"+itemId).append("<a class='showPromotion' href='#'><img src='/image/sale.png'></a>"); 
      });
      
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
  

  loadData = function()
  {
    itemNum = localStorage.getItem("itemNum");
    if(itemNum == undefined)
    {
      itemNum = 0;
      return;
    }

    for(i = 1; i<=itemNum; i++)
    {
      var itemId = "item" + i;
      var item = localStorage.getItem(itemId);
      var strip = i % 2 == 0 ? "gray" : "white"

      var para = $('<p>' + item + '</p>').attr( {"class": strip + ' item', id: itemId});
      $("#mylist").append(para);

      var dataId = "data" + i;
      var data = JSON.parse(localStorage.getItem(dataId));
      if(data == null || data.promotions.length == 0 ) continue;
      $("#data").append("<div id='" + dataId + "'>");
      data.promotions.forEach(function(promotion){
          $("#"+dataId).append( "<p><i>" + promotion.supplier + ":&nbsp;&nbsp;</i>" + promotion.content + "</p>" );
      });
      //append show promotion to the item
      $("#"+itemId).append("<a class='showPromotion' href='#'><img src='/image/sale.png'></a>");
    }
  }

  loadData();

});