/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

angular.module('APP', [])
    .controller('Controller', ControllerFunction);

function ControllerFunction($scope) {
    
    var text;
    var probabilities_array;
    var codes_array;
    var numbers_array;
    var active_signs_array;
    var clicked_sign;
    
    /* wywoływana za każdym razem, gdy zmienia się textarea */
    $scope.processData = function() {
        text = $scope.text_data; // odczytaj tekst z textarea
        $scope.text_array = getTextArray(text); // string --> array
        
        $scope.text_length = text.length; // długość tekstu
        clicked_sign = null; // początkowa wartość flagi wyróżnienia
        
        numbers_array = getNumbers(text); // liczności znaków
        probabilities_array = getProbabilities(text); // prawdopodobieństwa znaków
        codes_array = getCodes(probabilities_array); // kody znaków
        
        $scope.sortProperty = 'number'; // domyślnie sortuj po liczności
        $scope.reverse = true; // domyślnie - sortowanie malejące
        
        // kodowanie tekstu
        $scope.encoded_text_array = compressHuffman(text, codes_array);
        
        $scope.setStats(); // oblicz statystyki
        
        active_signs_array = initClassesArray(text); // zainicjuj tablicę wyróżnień
        
        // zbuduj strukturę tabeli prawdopodobieństw i kodów
        $scope.probs_codes_array = $scope.buildTable();
    };
    
    /* przygotowuje tablicę kodów i prawdopodobieństw */
    $scope.buildTable = function() {
        var array = new Array();
        var table_row;
        for(var sign in codes_array) {
            table_row = new tableRow();
            table_row.sign = sign;
            table_row.number = numbers_array[sign];
            table_row.code = codes_array[sign];
            array.push(table_row);
        }
        
        return array;
    };
    
    /* funkcja wywoływana w odpowiedzi na onclick wiersza tabeli prawd. i kodów */
    $scope.markSign = function(sign) {
        if(clicked_sign == sign) { // użytkownik chce wyłączyć wyróżnienie
            active_signs_array[sign] = false;
            clicked_sign = null; // brak wyróżnienia
        }
        else { // nowe wyróżnienie
            for(var elem in active_signs_array) {
                if(elem == sign) { // ustaw wyróżnienie
                    active_signs_array[elem] = true;
                }
                else
                    active_signs_array[elem] = false;
            }
            clicked_sign = sign; // ustaw bieżące wyróżnienie
        }
    };
    
    /* zwraca nazwę klasy dla zakodowanego tekstu w zależności od znaku */
    $scope.getClass = function(sign) {
        if(active_signs_array[sign])
            return 'active';
        else 
            return '';
    };
    
    /* zwraca nazwę klasy dla tabeli w zależności od znaku */
    $scope.getRowClass = function(sign) {
        if(active_signs_array[sign])
            return 'active-row';
        else 
            return '';
    }
    
    /* zwraca nazwę klasy dla tekstu w zależności od znaku */
    $scope.getSignClass = function(sign) {
        if(active_signs_array[sign])
            return 'active';
        else 
            return '';
    };
    
    /* obliczanie statystyk i ustawienie wyników w widoku */
    $scope.setStats = function() {
        $scope.entropy = getEntropy(probabilities_array);
        $scope.avg_length = getAverageLength(probabilities_array, codes_array);
        $scope.text_bytes = $scope.text_data.length;
        $scope.text_bits = $scope.text_bytes*8;
        $scope.code_bits = getEncodedData($scope.encoded_text_array).length;
        $scope.code_bytes = Math.ceil($scope.code_bits/8);
        $scope.comp_bits = 100*(($scope.text_bits - $scope.code_bits)/$scope.text_bits);
        $scope.comp_bytes = 100*(($scope.text_bytes - $scope.code_bytes)/$scope.text_bytes);
    };
    
    /* funkcja pomocnicza - sortowanie tabeli prawd. i kodów */
    $scope.sortBy = function(property) {
        $scope.reverse = ($scope.sortProperty === property) ? !$scope.reverse : false;
        $scope.sortProperty = property;
    };
}

