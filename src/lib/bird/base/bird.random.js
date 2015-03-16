define(function(require){
    function Random(){

    }

    (function(){
        /**
         * 从数组arr中随机出n个元素
         */
        this.randomFromArray = function (n, arr) {
            var indexArr = [];
            var ret = [];
            for (var i = 0; i < arr.length; i++) {
                indexArr[i] = i;
            }
            while (n--) {
                var randomInt = this.randomIntegerBetween(0, indexArr.length - 1);
                ret.push(arr[indexArr[randomInt]]);
                indexArr.splice(randomInt, 1);
            }
            return ret;
        };

        /**
         * 从[start, end]随机出一个数字, 包含start和end
         * 如[2, 10], 是从[2,3,4,5,6,7,8,9,10]中随机出一个数字
         */
        this.randomIntegerBetween = function (start, end) {
            return Math.floor((end - start + 1) * Math.random()) + start;
        };

        this.randomBetween = function (start, end) {
            return (end - start) * Math.random() + start;
        };
    }).call(Random.prototype);

    return new Random();
});