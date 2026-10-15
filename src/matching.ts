export type Requirements = { category: string; width: string; length: string; budget: string; locality: string }
export type MeasuredListing = { category: string; qty: number; price: number; locality: string; widthCm?: number; lengthCm?: number }
export const blankRequirements: Requirements = { category: 'Tiles', width: '', length: '', budget: '', locality: 'All localities' }
export function targetArea(r: Requirements): number | null {
 const w=Number(r.width), l=Number(r.length)
 return r.width.trim() && r.length.trim() && Number.isFinite(w) && Number.isFinite(l) && w>0 && l>0 ? w*l/10000 : null
}
export function listingArea(x: MeasuredListing): number | null {
 return x.widthCm && x.lengthCm && x.widthCm>0 && x.lengthCm>0 && x.qty>0 ? x.widthCm*x.lengthCm*x.qty/10000 : null
}
export function matchEvidence(x: MeasuredListing, r: Requirements) {
 const area=listingArea(x), target=targetArea(r)
 const categoryFits=x.category===r.category
 const overBudget=r.budget.trim()!=='' && x.price>Number(r.budget)
 const locationFits=r.locality==='All localities'||x.locality===r.locality
 const coverage=categoryFits&&area!==null&&target!==null ? area/target : null
 const status=!categoryFits?'Different material':!locationFits?'Outside chosen locality':overBudget?'Over budget':coverage===null?'Needs confirmation':coverage>=1?'Enough area':'Quantity short'
 return {area,target,coverage,status,categoryFits,overBudget,locationFits}
}
export const areaText=(n:number)=>`${n.toFixed(2)} m²`
