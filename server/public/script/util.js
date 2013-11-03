String.prototype.itemlize = function(){
	return ("__item__" + this);
}


String.prototype.deItemlize = function(){
	return this.substr(8);
}

String.prototype.isItem = function(){
	return this.indexOf("__item__") == 0;
}
