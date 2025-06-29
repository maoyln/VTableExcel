const TOKEN_NUMBER = 'number'
const TOKEN_OPERATOR = 'operator'
const TOKEN_IDENTIFIER = 'identifier'
const TOKEN_STRING = 'string'
const TOKEN_BOOLEARN = 'boolean'
const TOKEN_EOF = 'eof'
const TOKEN_ERROR = 'error'

interface Token {
  type: string
  value: any
  callee?: string[]
  args?: any[]
}

function isOperator (c: string): boolean { return /[+\-x÷*/^%=()><!:]/.test(c) }
function isOperationalCharacter (c: string): boolean { return /[+\-x÷*/^%=(]/.test(c) }
function isDigit (c: string): boolean { return /[0-9]/.test(c) }
function isAlphaOrLine (c: string): boolean { return /[a-zA-Z_$]/.test(c) }
function isAlphaOrLineOrintegerber (c: string): boolean { return /[0-9a-zA-Z_${}]/.test(c) }
function isWhiteSpace (c: string): boolean { return /\s/.test(c) }
function isString (c: string): boolean { return /[^"']/.test(c) }
function isQuotes (c: string): boolean { return /"|'/.test(c) }
function isComma (c: string): boolean { return /,/.test(c) }

// 获取运算符优先级，数值越大，优先级越低
function getPriority (op: { value: string }): number {
  const operatorPriority = {
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
  return operatorPriority[op.value] || 0
}

class express {
  expression: string
  charIndex: number
  currentToken: Token | null

  constructor (expression: string) {
    this.expression = expression
    // 当前指针位置
    this.charIndex = 0
    this.currentToken = null
    return this._expr() as any
  }

  // 比较运算符优先级
  comparePriority (opa: { value: string }, opb: { value: string }): number {
    const a = getPriority(opa)
    const b = getPriority(opb)
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
      args: operand.args // 函数参数列表
    })
  }

  // 新增运算符
  addOperator (operator: Token, operatorStack: Token[]): void {
    operatorStack.push({
      type: operator.type,
      value: operator.value
    })
  }

  _expr (): Token[] {
    let curToken: Token | null = null
    let curOperand: Token | null = null
    let curOperator: Token | null = null
    // 操作数推栈
    const operandStack: Token[] = []
    // 正括号数量
    const qcount: { length: number } = { length: 0 }
    // 操作符推栈
    const operatorStack: Token[] = []
    while ((curToken = this._next()).type !== TOKEN_EOF) {
      const { type, value } = curToken
      if (type === TOKEN_NUMBER) {
        curOperand = curToken
        this.addOperand(curOperand, operandStack)
      } else if (type !== TOKEN_STRING && value === '(') { // 不包含函数的 函数内部自己处理
        qcount.length++ // 运算符括号计数
        curOperator = curToken
        this.addOperator(curOperator, operatorStack)
      } else if (type !== TOKEN_STRING && qcount.length === 0 && curToken.value === ')') { // 没有括号 并且当前操作符是 反括号 代表是函数结束
        break
      } else if (type !== TOKEN_STRING && value === ')') { // 如过是反括号操作符结束
        this.handleParenthesis(operatorStack, operandStack, qcount)
      } else if (type === TOKEN_STRING) { // 如过是字符串 直接放到操作符中
        this.addOperand(curToken, operandStack)
      } else if (type === TOKEN_IDENTIFIER) { // 如果是标识符
        this.handleIdentifier(curOperand, curToken, operandStack)
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

  createToken (type: string, value: any): Token {
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
        // break
      } else {
        // 如过不是括号直接放到操作数了
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
      // 取得操作符栈的最顶层操作符
      const last = operatorStack[operatorStack.length - 1]
      // 对比操作符优先级
      if (this.comparePriority(curOperator, last) === 1) {
        this.addOperator(curOperator, operatorStack)
      } else {
        // 若当前运算符若比运算符堆栈栈顶的运算符优先级低或相等，则输出栈顶运算符到操作数堆栈，直至运算符栈栈顶运算符低于（不包括等于）该运算符优先级，
        // 或运算符栈栈顶运算符为左括号
        // 并将当前运算符压入运算符堆栈。
        while (operatorStack.length > 0) {
          if (this.comparePriority(curOperator, operatorStack[operatorStack.length - 1]) < 1 && operatorStack[operatorStack.length - 1].value !== '(') {
            // this.qcount--//运算符括号计数
            this.addOperand(operatorStack.pop() as Token, operandStack)
            //
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

  // 处理标识符
  handleIdentifier (curOperand: Token | null, curToken: Token, operandStack: Token[]): void {
    curOperand = curToken
    curOperand.callee = []// 调用者链
    curOperand.args = []// 参数列表
    curOperand.callee.push(curToken.value)
    // 循环处理属性调用
    while (true) {
      // 记录当前字符位置
      const cIndex = this.charIndex
      const nextToken = this._next()
      if (nextToken.type === TOKEN_IDENTIFIER) {
        curOperand.callee.push(nextToken.value)
      } else if (nextToken.value === '(') {
        // 循环处理 函数参数（每个参数都是一个独立的表达式）
        while (true) {
          // 参数表达式
          const _fpTokens = this._expr()
          curOperand.args.push(_fpTokens)
          // 参数处理完毕则 退出循环
          if ((this.currentToken as Token).value === ')') {
            break
          }
        }
        break
      } else {
        this.charIndex = cIndex// 还原
        break
      }
    }
    if (this.isBoolean(curOperand.value)) {
      this.addOperand({
        value: curOperand.value === 'true',
        type: TOKEN_BOOLEARN
      }, operandStack)
    } else {
      this.addOperand(curOperand, operandStack) // 当作一个特殊的操作数
    }
  }

  // 是否是布尔值
  isBoolean (value: string): boolean {
    return ['true', 'false'].includes(value)
  }

  _next (): Token {
    let c = ''
    const expression = this.expression
    while (this.charIndex < expression.length) {
      c = expression[this.charIndex]
      if (isDigit(c)) {
        return this.matchDigit(c)
      } else if (isQuotes(c)) {
        return this.matchSting(c)
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
  matchingNumber (c: string): string {
    this.charIndex++
    const expression = this.expression
    let number = c
    const isFloat = false
    while (this.charIndex < expression.length) {
      c = expression[this.charIndex]
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
    return number
  }

  // 匹配数字
  matchDigit (c: string): Token {
    const integer = this.matchingNumber(c)
    return this.createToken(TOKEN_NUMBER, integer)
  }

  // 匹配逗号
  matchComma (): Token {
    this.charIndex++
    return this.createToken(TOKEN_EOF, 0)
  }

  // 匹配空白字符
  matchSpace (c: string): void {
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
  isEOF (c: string | undefined): boolean {
    return c === ',' || c === undefined
  }

  // 匹配操作符
  matchOperator (c: string): Token {
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
    let name = c
    this.charIndex++
    while (this.charIndex < this.expression.length) {
      c = this.expression[this.charIndex]
      if (isAlphaOrLineOrintegerber(c)) {
        this.charIndex++
        name = name + c
      } else if (c === '(') { // 函数
        return this.createToken(TOKEN_IDENTIFIER, name)
      } else if (c === '.') { // 对象
        this.charIndex++ // 忽略对象属性直接的 点号
        return this.createToken(TOKEN_IDENTIFIER, name)
      } else if (c === ':') { // Excel范围引用，如 B4:B9
        this.charIndex++
        // 继续读取范围的结束部分
        let rangeEnd = ''
        while (this.charIndex < this.expression.length) {
          c = this.expression[this.charIndex]
          if (isAlphaOrLineOrintegerber(c)) {
            this.charIndex++
            rangeEnd = rangeEnd + c
          } else {
            break
          }
        }
        return this.createToken(TOKEN_IDENTIFIER, name + ':' + rangeEnd)
      } else {
        return this.createToken(TOKEN_IDENTIFIER, name)
      }
    }
    return this.createToken(TOKEN_IDENTIFIER, name)
  }

  // 匹配字符串
  matchSting (c: string): Token {
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
  escapedString (str: string): string {
    // "1\\'2" 反序列化后 `{"string":"1\\'2"}`报错
    // 原因是 \' 是无效的转义 可直接处理成 '
    const _str = str.replace(/\\'/g, "'")
    try {
      return JSON.parse(`{"string":"${_str}"}`).string
    } catch (e) {
      return _str
    }
  }
}

export default express
