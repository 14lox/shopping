$(function(){
   //create habit form behavior
   $("#submitButton").click(function(event){
      event.preventDefault();
      var posting = $.post("/promotion/post_query", {query: $("#item").val()});
      posting.done(function( data ) {
        data.forEach(function(promotion){
           $("#mylist").append( "<p><i>" +promotion.supplier + ":&nbsp;&nbsp;</i>" + promotion.content + "</p>" );
        });
        
      });
   });
});