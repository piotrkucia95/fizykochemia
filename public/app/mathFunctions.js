integration = function(f, a, b) {
    var N = 100;
    var s,dx,i,t;

    s = 0;
    dx = (b - a) / N;
    for(i = 1; i < N; i++) 
        s += f(a + i * dx);
    
    s = (s + (f(a) + f(b)) / 2) * dx;
    return s;
}

linearFunction = function(x) {
    return x;
}

triangleFunction = function(x) {
	return -x + 10;
}

gaussFunction = function(x) {
	return Math.exp(-(x*x));
}