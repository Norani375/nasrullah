import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sql = neon(process.env.DATABASE_URL!);
  const { action, params } = req.body;

  try {
    let result: unknown = { success: true };
    switch (action) {
      case 'fetchRawMaterials':
        result = await sql`SELECT * FROM raw_materials ORDER BY id DESC`;
        break;
      case 'addRawMaterial':
        await sql`INSERT INTO raw_materials (name,unit,quantity,price_per_unit,supplier,min_stock) VALUES (${params.name},${params.unit},${params.quantity},${params.price_per_unit},${params.supplier},${params.min_stock})`;
        break;
      case 'updateRawMaterial':
        await sql`UPDATE raw_materials SET name=${params.name},unit=${params.unit},quantity=${params.quantity},price_per_unit=${params.price_per_unit},supplier=${params.supplier},min_stock=${params.min_stock},updated_at=NOW() WHERE id=${params.id}`;
        break;
      case 'deleteRawMaterial':
        await sql`DELETE FROM raw_materials WHERE id=${params.id}`;
        break;
      case 'fetchProducts':
        result = await sql`SELECT * FROM products ORDER BY id DESC`;
        break;
      case 'addProduct':
        await sql`INSERT INTO products (name,category,price,cost,stock,description) VALUES (${params.name},${params.category},${params.price},${params.cost},${params.stock},${params.description})`;
        break;
      case 'updateProduct':
        await sql`UPDATE products SET name=${params.name},category=${params.category},price=${params.price},cost=${params.cost},stock=${params.stock},description=${params.description},updated_at=NOW() WHERE id=${params.id}`;
        break;
      case 'deleteProduct':
        await sql`DELETE FROM products WHERE id=${params.id}`;
        break;
      case 'fetchHardware':
        result = await sql`SELECT * FROM hardware ORDER BY id DESC`;
        break;
      case 'addHardware':
        await sql`INSERT INTO hardware (name,unit,quantity,price_per_unit,category,min_stock) VALUES (${params.name},${params.unit},${params.quantity},${params.price_per_unit},${params.category},${params.min_stock})`;
        break;
      case 'updateHardware':
        await sql`UPDATE hardware SET name=${params.name},unit=${params.unit},quantity=${params.quantity},price_per_unit=${params.price_per_unit},category=${params.category},min_stock=${params.min_stock},updated_at=NOW() WHERE id=${params.id}`;
        break;
      case 'deleteHardware':
        await sql`DELETE FROM hardware WHERE id=${params.id}`;
        break;
      case 'fetchCustomers':
        result = await sql`SELECT * FROM customers ORDER BY id DESC`;
        break;
      case 'addCustomer':
        await sql`INSERT INTO customers (name,phone,address,balance,notes) VALUES (${params.name},${params.phone},${params.address},${params.balance},${params.notes})`;
        break;
      case 'updateCustomer':
        await sql`UPDATE customers SET name=${params.name},phone=${params.phone},address=${params.address},balance=${params.balance},notes=${params.notes},updated_at=NOW() WHERE id=${params.id}`;
        break;
      case 'deleteCustomer':
        await sql`DELETE FROM customers WHERE id=${params.id}`;
        break;
      case 'fetchExpenses':
        result = await sql`SELECT * FROM expenses ORDER BY id DESC`;
        break;
      case 'addExpense':
        await sql`INSERT INTO expenses (title,amount,category,date,description) VALUES (${params.title},${params.amount},${params.category},${params.date},${params.description})`;
        break;
      case 'deleteExpense':
        await sql`DELETE FROM expenses WHERE id=${params.id}`;
        break;
      case 'fetchSales':
        result = await sql`SELECT s.*,c.name as customer_name FROM sales s LEFT JOIN customers c ON s.customer_id=c.id ORDER BY s.id DESC`;
        break;
      case 'addSale': {
        const rows = await sql`INSERT INTO sales (customer_id,total_amount,paid_amount,discount,status,date,notes) VALUES (${params.customer_id},${params.total_amount},${params.paid_amount},${params.discount},${params.status},${params.date},${params.notes}) RETURNING id`;
        result = { id: rows[0].id };
        break;
      }
      case 'addSaleItem':
        await sql`INSERT INTO sale_items (sale_id,product_id,product_name,quantity,unit_price,total_price) VALUES (${params.sale_id},${params.product_id},${params.product_name},${params.quantity},${params.unit_price},${params.total_price})`;
        break;
      case 'fetchSaleItems':
        result = await sql`SELECT * FROM sale_items WHERE sale_id=${params.sale_id}`;
        break;
      case 'deleteSale':
        await sql`DELETE FROM sale_items WHERE sale_id=${params.id}`;
        await sql`DELETE FROM sales WHERE id=${params.id}`;
        break;
      case 'fetchProduction':
        result = await sql`SELECT * FROM production ORDER BY id DESC`;
        break;
      case 'addProduction':
        await sql`INSERT INTO production (product_id,product_name,quantity,status,start_date,notes) VALUES (${params.product_id},${params.product_name},${params.quantity},${params.status},${params.start_date},${params.notes})`;
        break;
      case 'updateProduction':
        if (params.status !== undefined && params.end_date !== undefined)
          await sql`UPDATE production SET status=${params.status},end_date=${params.end_date} WHERE id=${params.id}`;
        else if (params.status !== undefined)
          await sql`UPDATE production SET status=${params.status} WHERE id=${params.id}`;
        break;
      case 'deleteProduction':
        await sql`DELETE FROM production_materials WHERE production_id=${params.id}`;
        await sql`DELETE FROM production WHERE id=${params.id}`;
        break;
      case 'fetchDashboardStats': {
        const [p,cu,sa,ex,ls,ap,rv] = await Promise.all([
          sql`SELECT COUNT(*)::int as c FROM products`,
          sql`SELECT COUNT(*)::int as c FROM customers`,
          sql`SELECT COUNT(*)::int as c FROM sales`,
          sql`SELECT COALESCE(SUM(amount),0)::float as c FROM expenses`,
          sql`SELECT COUNT(*)::int as c FROM raw_materials WHERE quantity<=min_stock`,
          sql`SELECT COUNT(*)::int as c FROM production WHERE status='در حال تولید'`,
          sql`SELECT COALESCE(SUM(total_amount),0)::float as c FROM sales`,
        ]);
        result = { totalProducts:p[0].c, totalCustomers:cu[0].c, totalSales:sa[0].c, totalExpenses:ex[0].c, lowStockMaterials:ls[0].c, activeProduction:ap[0].c, totalRevenue:rv[0].c, totalCost:ex[0].c };
        break;
      }
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: String(error) });
  }
}
