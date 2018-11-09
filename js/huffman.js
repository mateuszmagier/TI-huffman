var numbers; // tablica liczebności

/* struktura obiektu repr. element drzewa */
function node() {
    this.left = null; // lewe dziecko (?)
    this.right = null; // prawe dziecko (?)
    this.prob = null; // prawdopodobieństwo
    this.value = null; // wartość, tj. znak
    this.code = ""; // kod
    this.parent = null; // rodzic
    this.visited = false; // czy został odwiedzony
}

/* struktura obiektu repr. wiersz tabeli (z prawd. i kodami) */
function tableRow() {
    this.sign = '';
    this.number = null;
    this.code = "";
}

/* struktura obiektu repr. znak i przypisany kod */
function encodedText() {
    this.sign = '';
    this.code = "";
}

/* funkcja sortująca tablicę prawdopodobieństw */
function sortNumberAsc(a, b) {
    return a[1] - b[1]; // sortuj po wartościach drugiej kolumny (a więc po prawdopodobieństwach)
}

/* funkcja zwraca tablicę kodów dla każdego znaku
 * np. tab['a'] = "001"
 */
function getCodes(prob) { // parametr - tablica prawdopodobieństw
    tree = new Array();
    secondTree = new Array();

    this.getNext = function() {
    if (tree.length > 0 && secondTree.length > 0 // jeśli w tablicach są jeszcze elementy
    && tree[0].prob < secondTree[0].prob) // 
    return tree.shift(); // shift usuwa z tablicy 1-wszy element, jednocześnie go zwracając

    if (tree.length > 0 && secondTree.length > 0 
    && tree[0].prob > secondTree[0].prob)
    return secondTree.shift();

    if (tree.length > 0)
    return tree.shift();

    return secondTree.shift();
    }

    /* tablica dwuwymiarowa
     * np. tab[2] = {'a', 0.125}
     *  
     */
    var sortedProb = new Array();
    var codes = new Array(); // tablica kodów

    var x = 0;

    for (var elem in prob) { // pętla po tablicy prawdopodobieństw - elem jest znakiem, prob[elem] - prawdopodobieństwem
        sortedProb[x] = new Array(elem, prob[elem]); // np. tab[2] = {'a', 0.125}
        x = x + 1; // licznik
    }

    sortedProb = sortedProb.sort(sortNumberAsc); // posortuj tab. prawdopodobieństw
    x = 0; // wyzeruj licznik

    // ustawia w drzewie znak i jego prawdopodobieństwo
    for (var elem in sortedProb) { // pętla po posortowanej tablicy prawd.
        tree[x] = new node(); // tree jest tablicą 'obiektów'
        tree[x].prob = sortedProb[elem][1]; // ustaw prawdopodobieństwo znaku
        tree[x].value = sortedProb[elem][0]; // ustaw znak
        x = x + 1; // kolejny znak
    }
    while (tree.length + secondTree.length > 1) { // dopóki jest więcej niż 1 drzewo...
        var left = getNext();
        var right = getNext(); // pobierz 2 drzewa o najmniejszym prawd.
        var newnode = new node(); // nowe drzewo
        newnode.left = left; // drzewa stają się lewym
        newnode.right = right; // i prawym poddrzewem
        newnode.prob = left.prob + right.prob; // suma prawdopodobieństw
        newnode.left.parent = newnode;
        newnode.right.parent = newnode;
        secondTree.push(newnode); // zapisz nowe drzewo
    }

    var currentnode = secondTree[0];
    var code = "";
    while (currentnode) {
        if (currentnode.value) {
            codes[currentnode.value] = code;
            code = code.substr(0, code.length - 1);
            currentnode.visited = true;
            currentnode = currentnode.parent;
        }
        else if (!currentnode.left.visited) {
            currentnode = currentnode.left;
            code += "0";
        }
        else if (!currentnode.right.visited) {
            currentnode = currentnode.right;
            code += "1";
        }
        else {
            currentnode.visited = true;
            currentnode = currentnode.parent;
            code = code.substr(0, code.length - 1);
        }
    }
    return codes;
}



/* zwraca zakodowany tekst */
function compressHuffman(input, codes) {
    var output = input.split(""); // tekst --> tablica znaków
    var encoded_text;
    var array = new Array(output.length);
    for (var elem in output) { // pętla po tablicy znaków
        encoded_text = new encodedText();
        encoded_text.sign = output[elem];
        encoded_text.code = codes[output[elem]];
        array.push(encoded_text);
    }
    return array;
}

function getNumbers(input) {
    numbers = new Array();
    var x = 0;
    var len = input.length; // długość tekstu
    while (x < len) { // pętla po znakach tekstu
        var chr = input.charAt(x); // pobierz znak
        if (numbers[chr]) { // jeśli w tab. prawd. jest już dany znak...
            numbers[chr] = numbers[chr] + 1; // ... inkrementuj jego licznik
        }
        else { // jeśli to 1-wsze wystąpienie znaku...
            numbers[chr] = 1; // ... zapisz jego 1-wsze wystąpienie
        }
        x++; // przejdź do kolejnego znaku
    }
    
    return numbers;
}

/* 
 * zwraca tablicę prawdopodobieństw znaków z inputa
 * np. tab['a'] = 0.125
 */
function getProbabilities(input) { // parametr - tekst do zakodowania z inputa
    var prob = new Array(); // tablica prawdopodobieństw (na razie - liczności)

    var len = input.length; // długość tekstu

    prob = getNumbers(input);

    for (var elem in prob) { // pętla po elementach tablicy liczności
        prob[elem] = prob[elem] / len; // zamień liczność na prawdopodobieństwo (liczność/ilość wszystkich znaków)
    }
    return prob; // zwróć tablicę prawdopodobieństw
}
 
/* inicjuje wartości w tablicy wyróżnień */
function initClassesArray(input) {
    var output = input.split("");
    var array = new Array(output.length);
    for(var sign in output)
        array[output[sign]] = false;
    return array;
}

/* zwraca tekst w postaci tablicy znaków */
function getTextArray(input) {
    var array = input.split("");
    return array;
}

/* zwraca wartość entropii */
function getEntropy(prob) {
    var sum = 0;
    var temp;
    for(var i in prob) {
        temp = prob[i] * Math.log2(1/prob[i]);
        sum += temp;
    }
    return sum;
}

/* zwraca zakodowany tekst w postaci łańcucha znaków */
function getEncodedData(array) {
    var output = '';
    for (var elem in array) {
        output += array[elem].code;
    }
    return output;
}

/* zwraca średnią długość słowa kodowego */
function getAverageLength(prob, codes) {
    var sum = 0;
    var temp;
    for(var i in prob) {
        temp = prob[i] * codes[i].length;
        sum += temp;
    }
    return sum;
}