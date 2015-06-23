
var lexer = function(input){
	var tokens = [],
		i = 0;

	var isOperator = function(c){
			return /[+\-*\/\^%=()]/.test(c);
		},

		isDigit = function(c){
			return /[0-9]/.test(c);
		},

		isWhiteSpace = function(c){
			return /\s/.test(c);
		},

		isIdentifier = function(c){
			return typeof c === "string" && !isOperator(c) && !isDigit(c) && !isWhiteSpace(c);
		},

		advance = function(){
			return c = input[++i];
		},

		addToken = function(type, value){
			tokens.push(value)
		}

	while(i < input.length){
		c = input[i];
		if(isWhiteSpace(c)){
			advance();
		}
		else if(isOperator(c)){
			addToken("operator", c);
			advance();
		}
		else if(isDigit(c)){
			num = c
			while(isDigit(advance())) num += c;
			if(c === "."){
				do num += c; while(isDigit(advance()));
			}
			num = parseFloat(num);
			addToken("number", num);
		}
		else if(isIdentifier(c)){
			idn = c
			while(isIdentifier(advance())) idn += c
			addToken("identifier", idn);
		}
	}
	
	return tokens;
}

function precedence(operator){
	operators = {
		'/': 1,
		'*': 2,
		'+': 3,
		'-': 4
	}
	return operators[operator]
}

var extractOperators = function(tokens){
	var operatorObject = []
	for(var i=0; i<tokens.length; i++){
		if(i%2 != 0){
			operatorObject.push({
				'operator': tokens[i], 
				'precedence': precedence(tokens[i]), 
				'position': i}
			)
		}
	}
	return operatorObject
}

function compare(a,b) {
	if (a.precedence < b.precedence)
		return -1;
	if (a.precedence > b.precedence)
		return 1;
	return 0;
}

var highestPrecedence = function(operatorObject){
	operatorObject.sort(compare)
	return operatorObject[0]
}

var parse = function(tokens, operatorObject){
	var higest = highestPrecedence(operatorObject)
	var group = [tokens[higest.position - 1], tokens[higest.position], tokens[higest.position + 1]]
	tokens.splice(higest.position - 1, 3, group);
	return tokens
}

var parser = function(tokens, operatorObject){

	if(operatorObject.length === 1){
		return tokens
	}
	else{
		tokens = parse(tokens, operatorObject)
		var operatorObject = extractOperators(tokens)
		parser(tokens, operatorObject)
		return tokens
	}

}

function eval(arr){
	var op1, op2, operator;
	// array is of the form [op1, operator, op2]
	// [[1,"+",2],"-",[2, "*", 3]]
	// op1 = [1, "+", 2]
	// operator = "-"
	// op2 = [2, "*", "3"]
	if (Array.isArray(arr)){
		op1 = eval(arr.shift()); // recursive call to eval since op1 might be an expression
		operator = arr.shift();
		op2 = eval(arr.shift()); // recursive call to eval since op2 might be an expression
	
		switch(operator) {
			case '+': return op1 + op2;
			case '-': return op1 - op2;
			case '*': return op1 * op2;
			case '/': return op1 / op2;
			default: throw new SyntaxError('Operator is not defined');
		}
	}
	else return parseFloat(arr);
}

var calls = function(expression, update){
	console.log('Expression: ' + expression)
	
	var tokens = lexer(expression);
	console.log('Tokens: ' + JSON.stringify(tokens))
	
	var operatorObject = extractOperators(tokens)
	
	var output = parser(tokens, operatorObject);
	
	console.log('Parser output: ' + JSON.stringify(output))
	
	var result = eval(output);
	console.log('Result: ' + result)
	update(result);
	return result;
}

$(function(){
	$('#calculate').click(function(e){
		var user_input = $('#user-input').val().split("\n");
		
		$('#result').empty();
		
		for(var i = 0; i < user_input.length; i++){
			calls(user_input[i], function(result) {
				console.log('done')
				console.log(result)
				$('#result').append(result + '<br/>');
			});
		}
	});
});