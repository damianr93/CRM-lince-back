// Migración: mover datos de "Animales: N" y "Tiempo: M" desde observaciones a cabezas/mesesSuplemento.
// No borra documentos. Solo actualiza si el campo destino está vacío.
// Uso:
//   node scripts/fix-chatbot-observaciones.mjs           -> dry-run
//   node scripts/fix-chatbot-observaciones.mjs --apply   -> aplica cambios

import 'dotenv/config';
import mongoose from 'mongoose';

const APPLY = process.argv.includes('--apply');
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI no definido en .env');
  process.exit(1);
}

const reAnimales = /Animales:\s*([^|]+?)(?=\s*\||$)/i;
const reTiempo   = /Tiempo:\s*([^|]+?)(?=\s*\||$)/i;
const reCategoria= /Categoría:\s*([^|]+?)(?=\s*\||$)/i;

function rebuildObservaciones(original, categoria) {
  const partes = ['Solicitud de cotización vía chatbot web'];
  if (categoria) partes.push('Categoría: ' + categoria.trim());
  return partes.join(' | ');
}

await mongoose.connect(uri);
const db = mongoose.connection.db;
console.log('DB conectada:', db.databaseName);
const col = db.collection('clients');
const total = await col.countDocuments();
console.log('Total clients:', total);

const cursor = col.find({
  observaciones: { $regex: 'chatbot web', $options: 'i' },
});

let candidatos = 0, conAnimales = 0, conTiempo = 0, conflicto = 0, aActualizar = 0;
const ops = [];

for await (const doc of cursor) {
  candidatos++;
  const obs = doc.observaciones || '';
  const mA = obs.match(reAnimales);
  const mT = obs.match(reTiempo);
  const mC = obs.match(reCategoria);

  if (!mA && !mT) continue;

  const cabezasNuevo = mA ? mA[1].trim() : null;
  const mesesNuevo   = mT ? mT[1].trim() : null;
  const categoria    = mC ? mC[1].trim() : null;

  const set = {};
  if (cabezasNuevo) {
    if (doc.cabezas && String(doc.cabezas).trim() !== '') {
      conflicto++;
      console.log(`  [skip cabezas] _id=${doc._id} ya tenia="${doc.cabezas}" nuevo="${cabezasNuevo}"`);
    } else {
      set.cabezas = cabezasNuevo;
      conAnimales++;
    }
  }
  if (mesesNuevo) {
    if (doc.mesesSuplemento && String(doc.mesesSuplemento).trim() !== '') {
      conflicto++;
      console.log(`  [skip meses] _id=${doc._id} ya tenia="${doc.mesesSuplemento}" nuevo="${mesesNuevo}"`);
    } else {
      set.mesesSuplemento = mesesNuevo;
      conTiempo++;
    }
  }

  // limpiar observaciones (siempre que haya match de animales o tiempo)
  set.observaciones = rebuildObservaciones(obs, categoria);

  if (Object.keys(set).length === 0) continue;
  aActualizar++;

  console.log(`upd _id=${doc._id} nombre="${doc.nombre || ''}" tel="${doc.telefono || ''}"`);
  console.log(`    antes: cabezas="${doc.cabezas || ''}" meses="${doc.mesesSuplemento || ''}" obs="${obs}"`);
  console.log(`    despues: ${JSON.stringify(set)}`);

  ops.push({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: set },
    },
  });
}

console.log('\n--- RESUMEN ---');
console.log('Candidatos (obs contiene "chatbot web"):', candidatos);
console.log('A setear cabezas:', conAnimales);
console.log('A setear mesesSuplemento:', conTiempo);
console.log('Conflictos (campo destino ya tenia valor, NO se toca):', conflicto);
console.log('Documentos a actualizar en total:', aActualizar);

if (!APPLY) {
  console.log('\nDRY-RUN. Re-ejecutar con --apply para escribir cambios.');
  await mongoose.disconnect();
  process.exit(0);
}

if (ops.length === 0) {
  console.log('Nada para aplicar.');
} else {
  const res = await col.bulkWrite(ops, { ordered: false });
  console.log('bulkWrite result:', JSON.stringify(res, null, 2));
}

await mongoose.disconnect();
