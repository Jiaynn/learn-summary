
self.onmessage = function (event) {
    var data = event.data;
    var ans = fibonacci(data);
    this.postMessage(ans);
};
 
function fibonacci(n) {
    return n<=2?1:fibonacci(n-2)+fibonacci(n-1);
}
