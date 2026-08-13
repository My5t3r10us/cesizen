import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
  console.log('🔍 Checking admin user...\n');
  
  const adminEmail = 'admin@cesizen.fr';
  
  try {
    const admin = await db.query.users.findFirst({
      where: eq(users.email, adminEmail),
    });

    if (!admin) {
      console.log('❌ Admin user NOT found in database');
      console.log(`   Email searched: ${adminEmail}`);
      console.log('\n💡 Solution: Run "npm run db:seed" to create the admin user');
    } else {
      console.log('✅ Admin user found!');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Banned: ${admin.isBanned}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log(`\n   Password hash: ${admin.passwordHash.substring(0, 50)}...`);
      
      if (admin.isBanned) {
        console.log('\n⚠️  WARNING: Admin user is BANNED!');
      }
    }

    // List all users
    console.log('\n📋 All users in database:');
    const allUsers = await db.select().from(users);
    console.log(`   Total users: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - Banned: ${user.isBanned}`);
    });

  } catch (error) {
    console.error('❌ Error checking admin:', error);
  } finally {
    process.exit(0);
  }
}

checkAdmin();
