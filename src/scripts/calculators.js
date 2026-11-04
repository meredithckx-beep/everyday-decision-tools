const money = (n, d=2) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const fmt = n => new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n);
const val = (root,key) => Number(root.querySelector(`[data-field="${key}"]`)?.value ?? 0);
const invalid = (...xs) => xs.some(x => !Number.isFinite(x) || x < 0);
const set = (root,sel,value) => { const el=root.querySelector(sel); if(el) el.textContent=value; };
const units = {
 g:{group:'mass',factor:1,label:'g'},kg:{group:'mass',factor:1000,label:'g'},oz:{group:'mass',factor:28.349523125,label:'g'},lb:{group:'mass',factor:453.59237,label:'g'},
 ml:{group:'volume',factor:1,label:'mL'},l:{group:'volume',factor:1000,label:'mL'},floz:{group:'volume',factor:29.5735295625,label:'mL'},
 each:{group:'count',factor:1,label:'item'}
};
function updateUnit(root) {
 const entries=[...root.querySelectorAll('.product-entry')].map((el,i)=>({el,name:el.querySelector('[data-product-name]')?.value.trim()||`Product ${String.fromCharCode(65+i)}`,price:Number(el.querySelector('[data-price]')?.value),qty:Number(el.querySelector('[data-quantity]')?.value),unit:el.querySelector('[data-unit]')?.value}));
 const out=root.querySelector('#unit-comparison'); if(!out)return;
 if(entries.some(e=>!Number.isFinite(e.price)||e.price<0||!Number.isFinite(e.qty)||e.qty<0)){out.textContent='Please enter valid non-negative prices and quantities.';return;}
 if(entries.some(e=>e.qty<=0)){out.textContent='Enter a package quantity greater than zero for every product.';return;}
 const first=units[entries[0].unit];
 if(!first||entries.some(e=>!units[e.unit]||units[e.unit].group!==first.group)){out.textContent='These units cannot be compared. Choose units from the same category (mass, volume, or items).';return;}
 const calc=entries.map(e=>({...e,baseQty:e.qty*units[e.unit].factor,unitPrice:e.price/(e.qty*units[e.unit].factor)}));
 const cheapest=[...calc].sort((a,b)=>a.unitPrice-b.unitPrice)[0];
 const basketQty=Math.max(...calc.map(e=>e.baseQty));
 const rows=calc.map(e=>({name:e.name,unitPrice:e.unitPrice,basket:e.unitPrice*basketQty}));
 const maxPrice=Math.max(...calc.map(e=>e.unitPrice));
 const difference=maxPrice-cheapest.unitPrice;
 const pct=maxPrice>0?difference/maxPrice*100:0;
 out.innerHTML='';
 const heading=document.createElement('p'); heading.className='comparison-winner'; heading.textContent=`${cheapest.name} has the lowest unit price.`;out.append(heading);
 const table=document.createElement('div');table.className='comparison-table';
 rows.forEach(r=>{const line=document.createElement('p');line.className='comparison-row';const name=document.createElement('strong');name.textContent=r.name;const detail=document.createElement('span');detail.textContent=`${money(r.unitPrice,4)} per ${first.label} · ${money(r.basket)} for ${fmt(basketQty)} ${first.label}`;line.append(name,detail);table.append(line);});
 out.append(table);
 const foot=document.createElement('p');foot.className='comparison-foot';foot.textContent=`Potential saving versus the highest unit price: ${money(difference,4)} per ${first.label} (${pct.toFixed(1)}%). Equivalent-basket costs use ${fmt(basketQty)} ${first.label}.`;out.append(foot);
}
function update(root){
 const type=root.dataset.calculator;const result=root.querySelector('[data-result]');const detail=root.querySelector('[data-detail]');
 if(!result||!detail)return;
 let headline='Enter your numbers',explanation='Results update as you change the values.';
 if(type==='unit-price'){updateUnit(root);const entries=[...root.querySelectorAll('.product-entry')];const validRows=entries.every(e=>Number(e.querySelector('[data-quantity]')?.value)>0);if(validRows){const vals=entries.map(e=>Number(e.querySelector('[data-price]')?.value)/(Number(e.querySelector('[data-quantity]')?.value)*units[e.querySelector('[data-unit]')?.value]?.factor));if(vals.every(Number.isFinite)){const min=Math.min(...vals);headline='Unit price comparison updated';explanation=`Lowest unit price: ${money(min,4)} per base unit. See the comparison below.`;}}}
 if(type==='gas-cost'){
  const distance=val(root,'distance'),eff=val(root,'efficiency'),price=val(root,'fuelPrice'),du=root.querySelector('[data-field="distanceUnit"]').value,eu=root.querySelector('[data-field="efficiencyUnit"]').value,pu=root.querySelector('[data-field="priceUnit"]').value;
  if(invalid(distance,eff,price)){headline='Check your values';explanation='Enter valid non-negative numbers.';}
  else if(distance===0&&eff===0&&price===0){}
  else if(eff===0){headline='Enter fuel efficiency';explanation='Fuel efficiency must be greater than zero.';}
  else {const km=du==='mi'?distance*1.609344:distance;let liters;if(eu==='mpg')liters=(du==='mi'?distance:km/1.609344)/eff*3.785411784;else if(eu==='l100')liters=km/100*eff;else liters=km/eff;const gallons=liters/3.785411784;const cost=liters*(pu==='gal'?price/3.785411784:price);headline=money(cost);explanation=`Estimated fuel: ${liters.toFixed(2)} L (${gallons.toFixed(2)} US gal). Cost: ${money(cost/(du==='mi'?distance:km),3)} per ${du==='mi'?'mile':'km'}.`;set(root,'[data-gas-fuel]',`${liters.toFixed(2)} L`);set(root,'[data-gas-total]',money(cost));set(root,'[data-gas-unit]',distance>0?money(cost/distance,3)+` / ${du}`:'—');}
 }
 if(type==='subscription-cost'){
  const payment=val(root,'payment'),frequency=root.querySelector('[data-field="frequency"]').value;const count={daily:365,weekly:52,monthly:12,quarterly:4,'half-yearly':2,yearly:1}[frequency];
  if(invalid(payment)||!count){headline='Check your values';explanation='Enter a valid payment and billing frequency.';}
  else {const annual=payment*count;const costs={daily:annual/365,weekly:annual/52,monthly:annual/12,quarterly:annual/4,'half-yearly':annual/2,yearly:annual};Object.entries(costs).forEach(([k,v])=>set(root,`[data-period-result="${k}"]`,money(v)));set(root,'[data-sub-annual]',money(annual));headline=payment?money(annual)+' per year':'Enter your payment';explanation='Equivalent costs based on the selected billing frequency.';}
  const m=val(root,'monthlyPrice'),a=val(root,'annualPrice');if(invalid(m,a)){set(root,'[data-monthly-year]','—');set(root,'[data-annual-year]','—');set(root,'[data-plan-saving]','Check values');}
  else {const my=m*12,saving=my-a;set(root,'[data-monthly-year]',money(my));set(root,'[data-annual-year]',money(a));set(root,'[data-plan-saving]',`${saving>=0?'Save ':'Costs '}${money(Math.abs(saving))}${my>0?` (${Math.abs(saving/my*100).toFixed(1)}%)`:''}`);}
 }
 if(type==='appliance-electricity'){
  const mode=root.querySelector('[data-field="applianceMode"]').value,compare=root.querySelector('[data-field="compare"]').checked;
  root.querySelectorAll('.energy-field').forEach(e=>e.hidden=mode!=='energy');root.querySelectorAll('#appliance-a > .field:not(.energy-field)').forEach(e=>{if(e.querySelector('[data-field="powerA"],[data-field="hoursA"]'))e.hidden=mode==='energy';});root.querySelector('.appliance-b')?.toggleAttribute('hidden',!compare);root.querySelector('.appliance-comparison')?.toggleAttribute('hidden',!compare);
  const read=(suffix)=>{const energy=mode==='energy'?val(root,'energy'+suffix):val(root,'power'+suffix)*val(root,'hours'+suffix)/1000;return {kwh:energy,rate:val(root,'rate'+suffix),hours:mode==='energy'?24:val(root,'hours'+suffix)};};
  const a=read('A'),values=[a.kwh,a.rate,a.hours];if(compare){const b=read('B');values.push(b.kwh,b.rate,b.hours);}
  if(invalid(...values)||a.hours>24||(compare&&read('B').hours>24)){headline='Check your values';explanation='Use non-negative values and no more than 24 hours per day.';}
  else {const daily=a.kwh*a.rate,monthly=daily*30.4375,annual=daily*365;set(root,'[data-elec-daily]',money(daily));set(root,'[data-elec-monthly]',money(monthly));set(root,'[data-elec-annual]',money(annual));set(root,'[data-elec-kwh]',fmt(a.kwh*365)+' kWh');headline=money(annual)+' per year';explanation=`Estimated annual energy use: ${fmt(a.kwh*365)} kWh.`;
   if(compare){const b=read('B'),bc=b.kwh*b.rate,diff=Math.abs(annual-bc*365),saving=Math.max(0,annual-bc*365),hourSaving=mode==='power'?Math.max(0,a.rate*val(root,'powerA')/1000*365):0;set(root,'[data-elec-difference]',money(diff));set(root,'[data-elec-saving]',money(saving));set(root,'[data-elec-hour-saving]',money(hourSaving));}}
 }
 if(type==='repair-replace'){
  const mode=root.querySelector('[data-field="repairMode"]').value,detailed=mode==='detailed';root.querySelector('.detailed-fields')?.toggleAttribute('hidden',!detailed);root.querySelector('.repair-results')?.toggleAttribute('hidden',!detailed);
  const repair=val(root,'repairCost'),fresh=val(root,'newPrice');const keys=['repairYears','repairMaintenance','repairEnergy','installCost','replaceYears','replaceMaintenance','replaceEnergy'];const nums=keys.map(k=>val(root,k));
  if(invalid(repair,fresh,...nums)){headline='Check your values';explanation='Enter valid non-negative values.';}
  else if(!detailed){const diff=fresh-repair;headline=diff>0?'Repair costs less upfront':diff<0?'Replacement costs less upfront':'Same upfront cost';explanation=`Repair: ${money(repair)}. New appliance: ${money(fresh)} before delivery or installation.`;}
  else {const ry=val(root,'repairYears'),ny=val(root,'replaceYears');if(ry<=0||ny<=0){headline='Enter expected years of use';explanation='Both options need an expected lifespan greater than zero.';}
   else {const rc=repair/ry+val(root,'repairMaintenance')+val(root,'repairEnergy'),nc=(fresh+val(root,'installCost'))/ny+val(root,'replaceMaintenance')+val(root,'replaceEnergy');set(root,'[data-repair-annual]',money(rc));set(root,'[data-replace-annual]',money(nc));set(root,'[data-repair-difference]',money(Math.abs(rc-nc))+` / year`);headline=rc<nc?'Repair appears cheaper per year':nc<rc?'Replacement appears cheaper per year':'Estimated annual costs are equal';explanation=`Repair: ${money(rc)} per year. Replace: ${money(nc)} per year, including the annualized upfront cost, maintenance, and electricity.`;}}
 }
 result.textContent=headline;detail.textContent=explanation;
}
document.querySelectorAll('[data-calculator]').forEach(root=>{
 root.addEventListener('input',()=>update(root));root.addEventListener('change',()=>update(root));
 root.addEventListener('click',event=>{
  if(event.target.closest('#add-product')){const template=root.querySelector('#product-template');const holder=root.querySelector('#products');if(template&&holder){const clone=template.content.cloneNode(true);clone.querySelector('legend').textContent=`Product ${String.fromCharCode(65+holder.children.length)}`;holder.append(clone);update(root);}}
  if(event.target.closest('.remove-product')){const entries=root.querySelectorAll('.product-entry');if(entries.length>2){event.target.closest('.product-entry').remove();update(root);}}
 });
 update(root);
});
