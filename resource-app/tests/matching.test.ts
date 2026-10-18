import assert from 'node:assert/strict'
import { test } from 'node:test'
import { targetArea, listingArea, matchEvidence, blankRequirements } from '../src/matching.ts'
const r={...blankRequirements,width:'60',length:'60',budget:'100'}
const x={category:'Materials',qty:48,price:0,locality:'Indiranagar',widthCm:10,lengthCm:10}
test('converts centimetres to square metres and detects adequate area',()=>{assert.equal(targetArea(r),0.36);assert.equal(listingArea(x),0.48);assert.equal(matchEvidence(x,r).status,'Enough area')})
test('small tiles produce a quantity shortage',()=>assert.equal(matchEvidence({...x,widthCm:5,lengthCm:5},r).status,'Quantity short'))
test('missing dimensions cannot assert coverage',()=>{assert.equal(matchEvidence({...x,widthCm:undefined},r).coverage,null);assert.equal(matchEvidence({...x,widthCm:undefined},r).status,'Needs confirmation')})
test('invalid or incomplete project dimensions remain unknown',()=>{for(const width of ['', '-1','Infinity','oops'])assert.equal(targetArea({...r,width}),null);assert.equal(targetArea({...r,length:''}),null)})
test('budget zero and locality constraints are honored',()=>{assert.equal(matchEvidence({...x,price:1},{...r,budget:'0'}).status,'Over budget');assert.equal(matchEvidence(x,{...r,locality:'HSR Layout'}).status,'Outside chosen locality')})
test('different categories are never credited toward project coverage',()=>{const e=matchEvidence({...x,category:'Furniture'},r);assert.equal(e.coverage,null);assert.equal(e.status,'Different material')})
