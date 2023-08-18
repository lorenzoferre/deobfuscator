**To do**:
4. seperazione in più file (binary-expressions, unary-expression ecc.)
5. implementazione dei test
6. evaluation di espressioni che contengono notazione jsfuck
. evaluation di espressioni che contengono funzioni interne a js (ex replace)
7. funzione per trovare se sono presenti espressioni binarie costanti
8. funzione per trovare se tutti i valori costanti sono stati propagati
    * visita dell'albero soltanto nello scope di dove si trova la variabile di cui si vuole cercare il valore
9. funzione per rimuovere le variabili o parti di codice che non vengono utilizzati
10. se le funzioni restituiscono valori costanti allora eliminare la funzione e tenere soltanto il valore restituito

**Done**:
1. evaluation di espressioni binarie contententi numeri, stringhe e booleani costanti
2. sostituizione di tutti i valori noti tramite l'utilizzo di path.isReferencedIdentifier
3. evaluation di espressioni che contengono operatori unari

**Links**
* https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9251923
* https://astexplorer.net/
* https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md
* https://github.com/geeksonsecurity/illuminatejs
* https://github.com/mindedsecurity/JStillery
* https://github.com/oncecreated/jscrambler-reverse-engineering
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/lastIndexOf
