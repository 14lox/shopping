var CountDown = function(hr, min, sec){
      this.hr = hr;
      this.min = min;
      this.sec = sec;

      this.reminding = 0;

      this.start = function(){
          var self = this;
          var tmmr = new Date(Date.now() + 24*1000*3600);
          var end = new Date(tmmr.getFullYear(), tmmr.getMonth(), tmmr.getDate());
          this.reminding = Math.floor((end.getTime() - Date.now())/1000);
          this.timer = window.setInterval(function() {self.updateTimer(self)}, 1000);
      };

      this.updateTimer = function(self){

          self.reminding -=1;
          if(self.reminding < 0){
            window.clearInterval(self.timer);
            return;
          }
          var hour = Math.floor(self.reminding / 3600);
          var min = Math.floor( (self.reminding - hour *3600)/60 );
          var sec = this.reminding - hour *3600 - min*60
          self.hr.html(hour);
          self.min.html(min);
          self.sec.html(sec);
      }
    }

$(function(){
    var countDown = new CountDown($('#hour'),$('#min'),$('#sec'));
    countDown.start();
});