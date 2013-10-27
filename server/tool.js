String.prototype.itemlize = function(){
	return ("__item__" + this);
}


String.prototype.deItemlize = function(){
	return this.substr(8);
}

String.prototype.isItem = function(){
	return this.indexOf("__item__") == 0;
}


var temp = 'abc'.itemlize();
var t1 = temp.deItemlize();
console.log(temp);
console.log(t1);
console.log(typeof(temp));
console.log(temp.isItem());
console.log(t1.isItem());

