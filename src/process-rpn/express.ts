import type { Token } from './solve';

const TOKEN_NUMBER = 'number' // 数字
const TOKEN_OPERATOR = 'operator' // 操作符
const TOKEN_IDENTIFIER = 'identifier' // 标识符（变量、函数、对象属性、对象方法）H1、SUM、A1:A5等等
const TOKEN_STRING = 'string' // 字符串
const TOKEN_BOOLEAN = 'boolean'
const TOKEN_EOF = 'eof' // 结束符
const TOKEN_ERROR = 'error'

function isOperator (c: string) { return /[+\-x÷*/^%=()><!:]/.test(c) } // 操作符字符
function isOperationalCharacter (c: string) { return /[+\-x÷*/^%=(]/.test(c) } // 操作符字符
function isDigit (c: string) { return /[0-9]/.test(c) } // 数字字符
function isAlphaOrLine (c: string) { return /[a-zA-Z_$]/.test(c) } // 字母或下划线字符
function isAlphaOrLineOrintegerber (c: string) { return /[0-9a-zA-Z_${}]/.test(c) } // 字母、下划线或数字字符
function isWhiteSpace (c: string) { return /\s/.test(c) } // 空白字符
function isString (c: string) { return /[^"']/.test(c) } // 字符串字符，排除引号
function isQuotes (c: string) { return /"|'/.test(c) } // 引号字符
function isComma (c: string) { return /,/.test(c) } // 逗号字符

// 获取运算符优先级，数值越大，优先级越低
function getPriority (op: { value: string }): number {
  const operatorPriority: Record<string, number> = {
    '(': 0,
    ')': 10,
    '*': 30,
    '/': 30,
    '%': 30,
    '+': 40,
    '-': 40,
    '>': 50,
    '>=': 50,
    '<': 50,
    '<=': 50,
    '==': 50,
    '!=': 50
  }
  return operatorPriority[op.value as keyof typeof operatorPriority] || 0
}

class express {
  expression: string
  charIndex: number
  currentToken: Token | null

  constructor (expression: string) {
    this.expression = expression
    this.charIndex = 0
    this.currentToken = null
    return this._expr() as any
  }

  // 比较运算符优先级
  comparePriority (opa: Token, opb: Token): number {
    const a = getPriority({ value: String(opa.value) })
    const b = getPriority({ value: String(opb.value) })
    if (a > b) {
      return -1
    } else if (a === b) {
      return 0
    } else {
      return 1
    }
  }

  // 新增操作数
  addOperand (operand: Token, operandStack: Token[]): void {
    operandStack.push({
      type: operand.type,
      value: operand.value,
      callee: operand.callee,
      args: operand.args
    })

    // console.log(JSON.stringify(operandStack), operandStack, 'operandStack');
  }

  // 新增运算符
  addOperator (operator: Token, operatorStack: Token[]): void {
    operatorStack.push({
      type: operator.type,
      value: operator.value
    })
    // console.log(JSON.stringify(operatorStack), operatorStack, 'operatorStack');
  }

  /**
   * 解析表达式 
   * @returns 
   */
  _expr () {
    let curToken: Token | null = null // 当前token
    let curOperand: Token | null = null // 当前操作数
    let curOperator: Token | null = null // 当前操作符
    // 操作数推栈
    const operandStack: Token[] = []
    // 正括号数量
    const qcount = { length: 0 }
    // 操作符推栈
    const operatorStack: Token[] = []
    while ((curToken = this._next()).type !== TOKEN_EOF) {
      // console.log(JSON.stringify(curToken), 'curToken');
      const { type, value } = curToken
      // console.log(type, 'type');
      // console.log(value, 'value');
      if (type === TOKEN_NUMBER) {
        // 如果是数据则数据压栈
        curOperand = curToken
        this.addOperand(curOperand, operandStack)
        // console.log(this.currentToken, 'this.currentToken');
      } else if (type !== TOKEN_STRING && value === '(') { // 不包含函数的 函数内部自己处理
        qcount.length++ // 运算符括号计数
        curOperator = curToken // 当前操作符
        this.addOperator(curOperator, operatorStack) // 运算符入栈
      } else if (type !== TOKEN_STRING && qcount.length === 0 && curToken.value === ')') { // 没有括号 并且当前操作符是 反括号 代表是函数结束
        break
      } else if (type !== TOKEN_STRING && value === ')') { // 如过是反括号操作符结束
        this.handleParenthesis(operatorStack, operandStack, qcount)
      } else if (type === TOKEN_STRING) { // 如果是字符串
        this.addOperand(curToken, operandStack) // 字符串直接入栈
      } else if (type === TOKEN_IDENTIFIER) { // 如果是标识符
        this.handleIdentifier(curOperand, curToken, operandStack) // 标识符处理
      } else {
        this.handleOperator(curOperator, curToken, operatorStack, operandStack)
      }
    }
    // 转换完成,若运算符堆栈中尚有运算符时,
    // 则依序取出运算符到操作数堆栈,直到运算符堆栈为空
    while (operatorStack.length > 0) {
      this.addOperand(operatorStack.pop() as Token, operandStack)
    }
    const finalTokens: Token[] = []
    while (operandStack.length > 0) {
      finalTokens.push(operandStack.shift() as Token)
    }
    return finalTokens
  }

  createToken (type: string, value: string | number) {
    const token: Token = {
      type,
      value
    }
    this.currentToken = token // 记录当前的token
    return token
  }

  // 处理括号
  handleParenthesis (operatorStack: Token[], operandStack: Token[], qcount: { length: number }): void {
    let bool = true
    while (bool) {
      const last = operatorStack[operatorStack.length - 1]
      if (last.value === '(') {
        operatorStack.pop()
        qcount.length--
        bool = false
      } else {
        this.addOperand(operatorStack.pop() as Token, operandStack)
      }
    }
  }

  // 处理操作符
  handleOperator (curOperator: Token | null, curToken: Token, operatorStack: Token[], operandStack: Token[]): void {
    curOperator = curToken
    if (operatorStack.length === 0) {
      this.addOperator(curOperator, operatorStack)
    } else {
      const last = operatorStack[operatorStack.length - 1]
      if (this.comparePriority(curOperator, last) === 1) {
        this.addOperator(curOperator, operatorStack)
      } else {
        while (operatorStack.length > 0) {
          if (this.comparePriority(curOperator, operatorStack[operatorStack.length - 1]) < 1 && operatorStack[operatorStack.length - 1].value !== '(') {
            this.addOperand(operatorStack.pop() as Token, operandStack)
            if (operatorStack.length === 0) {
              this.addOperator(curOperator, operatorStack)
              break
            }
          } else {
            this.addOperator(curOperator, operatorStack)
            break
          }
        }
      }
    }
  }


  /**
   * 处理标识符
   * @param curOperand 
   * @param curToken 
   * @param operandStack 
   */
  handleIdentifier (curOperand: Token | null, curToken: Token, operandStack: Token[]): void {
    curOperand = curToken // 当前操作数
    curOperand.callee = [] // 函数名或变量名
    curOperand.args = [] // 函数参数
    curOperand.callee.push(String(curToken.value)) // 将标识符的值作为函数名或变量名
    while (true) {
      const cIndex = this.charIndex // 记录当前字符索引
      const nextToken = this._next() // 获取下一个token
      if (nextToken.type === TOKEN_IDENTIFIER) {
        curOperand.callee.push(String(nextToken.value))
      } else if (nextToken.value === '(') {
        while (true) {
          const _fpTokens = this._expr()
          curOperand.args.push(_fpTokens)
          if (this.currentToken && this.currentToken.value === ')') {
            break
          }
        }
        break
      } else {
        this.charIndex = cIndex
        break
      }
    }
    if (this.isBoolean(curOperand.value)) {
      this.addOperand({
        value: curOperand.value === 'true',
        type: TOKEN_BOOLEAN
      } as Token, operandStack)
    } else {
      this.addOperand(curOperand, operandStack)
    }
  }

  // 是否是布尔值
  isBoolean (value: unknown): boolean {
    return value === 'true' || value === 'false'
  }

  _next () {
    let c = ''
    const expression = this.expression
    while (this.charIndex < expression.length) {
      c = expression[this.charIndex]
      if (isDigit(c)) {
        return this.matchDigit(c)
      } else if (isQuotes(c)) {
        return this.matchString(c)
      } else if (isComma(c)) {
        return this.matchComma()
      } else if (isWhiteSpace(c)) {
        this.matchSpace(c)
      } else if (isOperator(c)) {
        return this.matchOperator(c)
      } else if (isAlphaOrLine(c)) {
        return this.matchIdentifier(c)
      } else {
        this.charIndex++
        if (typeof console !== 'undefined') console.error('非法字符' + c)
        return this.createToken(TOKEN_ERROR, 0)
      }
    }
    return this.createToken(TOKEN_EOF, 0)
  }

  // 处理数字
  matchingNumber (c: string) {
    this.charIndex++
    const expression = this.expression
    // let integer = parseInt(c)
    let number = c
    // let decimalPlaces = ''//如果是浮点数，先用此数记录小数后的部分
    const isFloat = false
    // console.log(c, 'c');
    // console.log(this.charIndex, 'this.charIndex');
    while (this.charIndex < expression.length) {
      c = expression[this.charIndex]
      // console.log(c, 'c');
      // console.log(isDigit(c), 'isDigit(c)');
      if (isDigit(c) || (c === '.' && !isFloat)) {
        this.charIndex++
        if (isFloat) {
          number = number + c
        } else {
          if (c === '.') {
            number = number + '.'
          } else {
            number = number + c
          }
        }
      } else {
        break
      }
    }
    // integer = isFloat ? parseFloat(integer + '.' + decimalPlaces) : integer
    console.log(number, 'number');
    return number
  }

  // 匹配数字
  matchDigit (c: string) {
    const integer = this.matchingNumber(c)
    return this.createToken(TOKEN_NUMBER, integer)
  }

  // 匹配逗号
  matchComma () {
    this.charIndex++
    return this.createToken(TOKEN_EOF, 0)
  }

  // 匹配空白字符
  matchSpace (c: string) {
    this.charIndex++
  }

  // 获取上一个有效字符
  getPreviousCharacter (): string | undefined {
    let index = this.charIndex
    let previousCharacter: string | undefined
    while (index > 0) {
      index--
      previousCharacter = this.expression[index]
      if (!isWhiteSpace(previousCharacter)) {
        break
      }
    }
    return previousCharacter
  }

  // 判断是否是结束符
  isEOF (c: string | undefined) {
    return c === ',' || c === undefined
  }

  // 匹配操作符
  matchOperator (c: string) {
    // 如果当前是- 并且前一位是操作符或者是空 说明当前为负数 并不是操作符
    const operators = ['>=', '!=', '<=', '==']
    let _c = c
    const previousCharacter = this.getPreviousCharacter()
    if (c === '-' && (this.isEOF(previousCharacter) || isOperationalCharacter(previousCharacter!))) {
      this.charIndex++
      const integer = this.matchingNumber(this.expression[this.charIndex])
      return this.createToken(TOKEN_NUMBER, '-' + integer)
    } else {
      this.charIndex++
      const str = this.expression[this.charIndex]
      if (isOperator(str) && operators.includes(_c + str)) {
        this.charIndex++
        _c += str
      }
      return this.createToken(TOKEN_OPERATOR, _c)
    }
  }

  // 匹配标识符 （变量，函数，对象属性，对象方法）
  matchIdentifier (c: string): Token {
    let name = c;
    this.charIndex++;
    while (this.charIndex < this.expression.length) {
      c = String(this.expression[this.charIndex]);
      if (isAlphaOrLineOrintegerber(c)) {
        this.charIndex++;
        name = name + c;
      } else if (c === '(') {
        return this.createToken(TOKEN_IDENTIFIER, name);
      } else if (c === '.') {
        this.charIndex++;
        return this.createToken(TOKEN_IDENTIFIER, name);
      } else if (c === ':') {
        this.charIndex++;
        let rangeEnd = '';
        while (this.charIndex < this.expression.length) {
          c = String(this.expression[this.charIndex]);
          if (isAlphaOrLineOrintegerber(c)) {
            this.charIndex++;
            rangeEnd = rangeEnd + c;
          } else {
            break;
          }
        }
        return this.createToken(TOKEN_IDENTIFIER, name + ':' + rangeEnd);
      } else {
        return this.createToken(TOKEN_IDENTIFIER, name);
      }
    }
    return this.createToken(TOKEN_IDENTIFIER, name);
  }

  // 匹配字符串
  matchString (c: string) {
    let name = ''
    const quotation = c
    this.charIndex++
    while (this.charIndex < this.expression.length) {
      c = this.expression[this.charIndex]
      if (isString(c)) {
        this.charIndex++
        name = name + c
      } else {
        if (name.slice(name.length - 1) === '\\' || quotation !== c) {
          this.charIndex++
          name = name + c
        } else {
          this.charIndex++
          break
        }
      }
    }
    return this.createToken(TOKEN_STRING, this.escapedString(name))
  }

  // 转义字符串 因为有可能字符串中存在被重复转义情况 例如: fn("子曰:\"三人行,必有我师焉\"") 提交数据会变成 fn("子曰:\\"三人行,必有我师焉\\"")
  escapedString (str: string) {
    // "1\\'2" 反序列化后 `{"string":"1\\'2"}`报错
    // 原因是 \' 是无效的转义 可直接处理成 '
    const _str = str.replace(/\\'/g, '\'')
    try {
      return JSON.parse(`{"string":"${_str}"}`).string
    } catch (e) {
      console.log(e);
      return _str
    }
  }
}

export default express
