function calculate(exp, f){
	
}

function getToken(name){
	if(name.search('lang:') == 0){
		return [1,2,3,4];
	}else
		return [];
}

'polskie - hity'

'1-'

"~lang:polski" = "all - lang:polski"
x in "a|b" <=> (x in a) and (x in b)
x in "a+b" <=> (x in a) or (x in b)
x in "a-b" <=> (x in a) and (x not in b)

/*
<roznica> ::= "-"
<suma> ::= "+"
<iloczyn> ::= "-"
<negacja> ::= "~"

<spacja> ::= " "
<cyfra> ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
<litera> ::= "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
<lacznik> ::= "-"
<separator-pola> ::= ":"
<nawias-lewy> ::= "("
<nawias-prawy> ::= ")"

<spacja> ::= " "
<ciag-spacji> ::= <spacja> | <spacja><ciag-spacji>

<symbol> ::= <cyfra> | <litera> | <lacznik>
<symbol-poczatkowy> ::= <cyfra> | <litera>
<ciag-symboli> ::= <symbol> | <symbol><ciag-symboli>

<identyfikator> ::= 
				<symbol-poczatkowy> | 
				<symbol-poczatkowy><symbol-poczatkowy> | 
				<symbol-poczatkowy><ciag-symboli><symbol-poczatkowy>


<token> ::= <identyfikator> | <identyfikator><separator-pola><identyfikator>

<wyrazenie> ::= 
			<token> | 
			<nawias-lewy><wyrazenie><nawias-prawy> | 
			<negacja><token> | 
			<negacja><nawias-lewy><wyrazenie><nawias-prawy> |
			<wyrazenie><roznica><wyrazenie> |
			<wyrazenie><suma><wyrazenie> | 
			<wyrazanie><iloczyn><wyrazenie>
*/

/*
 * Tokeny:
 * lang:polish, tag:hello-world, rating:5, rating:4, year:1992, author-like:dj
 * rating-more:4, year-more:1970
 * autor:nightwish, genre:metal, hello-world
 */

var x = calculate("lang:polish - lang:polski", getToken);
console.log(x);

var x = calculate("(lang:polish|genre:metal) + year:1992", getToken);
console.log(x);



