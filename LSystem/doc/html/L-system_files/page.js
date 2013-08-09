$(document).ready(function() {
    try {
	    var q = $("#q");
	    q.searchbox("/find", {"mode": "quick"});
	} catch(e) {
	    alert("Create searchbox: "+e);
	}
	
	var anims = $("img.anim")
	anims.each(function(i) {
		var src = this.src
		var poster = src.replace(/.gif$/, "_poster.gif")
		this.setAttribute("data-anim", src)
		this.setAttribute("data-poster", poster)
		this.src = poster
	})
	anims.on("mouseover", function() {
		this.src = this.getAttribute("data-anim")
	})
	anims.on("mouseout", function() {
		this.src = this.getAttribute("data-poster")
	})
});





