/**
 * 解决数学计算精度问题的类
 *
 */
define(function(require) {

	function AccMath() {}

	(function() {
		this.add = function(a, b) {
			var r1, r2, m, c;
		    try {
		        r1 = a.toString().split('.')[1].length;
		    }
		    catch (e) {
		        r1 = 0;
		    }
		    try {
		        r2 = b.toString().split('.')[1].length;
		    }
		    catch (e) {
		        r2 = 0;
		    }
		    c = Math.abs(r1 - r2);
		    m = Math.pow(10, Math.max(r1, r2));
		    if (c > 0) {
		        var cm = Math.pow(10, c);
		        if (r1 > r2) {
		            a = Number(a.toString().replace('.', ''));
		            b = Number(b.toString().replace('.', '')) * cm;
		        } else {
		            a = Number(a.toString().replace('.', '')) * cm;
		            b = Number(b.toString().replace('.', ''));
		        }
		    } else {
		        a = Number(a.toString().replace('.', ''));
		        b = Number(b.toString().replace('.', ''));
		    }
		    return (a + b) / m;
		};

		this.sub = function(a, b) {
			var r1, r2, m, n;
		    try {
		        r1 = a.toString().split('.')[1].length;
		    }
		    catch (e) {
		        r1 = 0;
		    }
		    try {
		        r2 = b.toString().split('.')[1].length;
		    }
		    catch (e) {
		        r2 = 0;
		    }
		    m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
		    n = (r1 >= r2) ? r1 : r2;
		    return ((a * m - b * m) / m).toFixed(n);
		};

		this.multipe = function(a, b) {
			var m = 0, s1 = a.toString(), s2 = b.toString();
		    try {
		        m += s1.split('.')[1].length;
		    }
		    catch (e) {}
		    try {
		        m += s2.split('.')[1].length;
		    }
		    catch (e) {}
		    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
		};


		this.divide = function(a, b) {
			var t1 = 0, t2 = 0, r1, r2;
		    try {
		        t1 = a.toString().split('.')[1].length;
		    }
		    catch (e) {}
		    try {
		        t2 = b.toString().split('.')[1].length;
		    }
		    catch (e) {}

	        r1 = Number(a.toString().replace('.', ''));
	        r2 = Number(b.toString().replace('.', ''));
	        return (r1 / r2) * Math.pow(10, t2 - t1);
		};
	}).call(AccMath.prototype);

	return new AccMath();
});
