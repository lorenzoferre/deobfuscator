**To do**:
1. controllare se nel punto 2 (Done) la visita avviene dalla radice o soltanto dallo scope di dove si trova la variabile
2. evaluation di espressioni che contengono operatori unari
3. evaluation di espressioni che contengono notazione jsfuck
4. evaluation di espressioni che contengono funzioni interne a js (ex replace)
5. funzione per trovare se sono presenti espressioni binarie costanti
6. funzione per trovare se tutti i valori costanti sono stati propagati
    * visita dell'albero soltanto nello scope di dove si trova la variabile di cui si vuole cercare il valore
7. funzione per rimuovere le variabili o parti di codice che non vengono utilizzati
8. se le funzioni restituiscono valori costanti allora eliminare la funzione e tenere soltanto il valore restituito

**Done**:
1. evaluation di espressioni binarie contententi numeri, stringhe e booleani costanti
2. sostituizione di tutti i valori noti (calcolati nel punto 1) nelle espressioni che ne fanno uso
    * ogni volta che nell'albero si trova un identificatore che sia a dx dell'espressione
       viene effettuata la visita dell'albero per controllare se quell'identificatore ha un valore costante (literal).
       nel caso ci fosse sostituisce l'identificatore con il valore

**Link**
* [https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9251923]
* [https://astexplorer.net/]
* [https://github.com/geeksonsecurity/illuminatejs]
* [https://github.com/mindedsecurity/JStillery]
* [https://github.com/oncecreated/jscrambler-reverse-engineering]
