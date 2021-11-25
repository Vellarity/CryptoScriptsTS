import { isSimple, power, isCompire, getRandomArbitrary } from "../helper/helper";
import { bint, num, NB, BN } from "../types";
import colors from 'colors'
import { numsToText, textToNums } from "../helper/text";
import { ALPHABET, ALPHABETDOTS, BIGTEXTVAR1, BIGTEXTVAR10, TEXT1000VAR1 } from "../helper/globals";
import { inverseOf } from "../helper/math";

process.on('error',err =>{
  console.error(colors.red('EXIT_CODE:'), err)
})

type PublicKey = {
  p:bint,
  g:bint,
  y:bint
}

type PrivateKey = {
  x:bint,
  p:bint
}

const initialValues = (p:bint, Mi:num, x:bint, g:bint) =>{
  if (p < Mi || !isSimple(p)){
    //! Число p не простое или меньше Mi
    console.error(colors.red('Число p не простое или меньше Mi'))
    process.exit(1)
  }
  if (x > p || g > p){
    //! Числа x и g больше p
    console.error(colors.red('Числа x и g больше p'))
    process.exit(2)
  }

  const y:any = power(g,x,p)

  const pubKey:PublicKey = {p:p, g:g, y:y}

  const privKey:PrivateKey = {x:x, p:p}

  return {pubKey, privKey}
}

const enc = (indexes:num[], pubKey:PublicKey, ks?:bint[]) =>{
  let result:any[] = []
  let kIndex = 0
  const getRandomK = ():bint =>{
    /* 
      * Функция - генератор k

      * Если в переменную будут записаны несколько значений, то алгоритм будет прогонять цикл по записанным значениям, если нет - генерировать k случайно
    */
    if (!ks){
      let k:bint = getRandomArbitrary(2, Number(pubKey.p)-2)
      if (!isCompire(NB(k),NB(pubKey.p))) 
        return getRandomK()
      else return k
    }
    else{
      let k = ks[kIndex]
      kIndex += 1
      if (kIndex > ks.length - 1) 
        kIndex = 0
      return k
    }
  }

  indexes.forEach(item =>{
    let k = getRandomK()
    let ai:bint = (pubKey.g ** k) % pubKey.p
    let bi:bint = (pubKey.y ** k) * NB(item) % pubKey.p
    result.push([ai,bi])
  })

  return result
}

const dec = (indexes:any[], privKey:PrivateKey) =>{
  let result:any[] = []

  indexes.forEach(item =>{
    let a:bint = item[0],b:bint = item[1]
    let index:any = Number((NB(inverseOf(a ** privKey.x, privKey.p)) * b) % privKey.p)
    console.log((NB(inverseOf(a ** privKey.x, privKey.p)) * b)% privKey.p)
    const setIndex = (index:any):any =>{
      if (index < 0)
        return setIndex(index + Number(privKey.p))
      else
        return index
    }
    index = setIndex(index)
    result.push(index)
  })
  return result
}

let pubKey:PublicKey =  /* initialValues(97n,ALPHABETDOTS.length, 83n,73n).pubKey */{
  p:37n,
  g:7n,
  y:12n
}

let privKey:PrivateKey =           /* initialValues(97n,ALPHABETDOTS.length, 83n,73n).privKey */{
  x:11n,
  p:37n
}

console.log(enc(textToNums(TEXT1000VAR1, ALPHABETDOTS), pubKey))

let result = dec(enc(textToNums(TEXT1000VAR1, ALPHABETDOTS), pubKey),privKey)

console.log(numsToText(result, ALPHABETDOTS))