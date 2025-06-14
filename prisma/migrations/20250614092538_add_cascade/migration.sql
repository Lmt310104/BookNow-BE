-- DropForeignKey
ALTER TABLE "GroupItems" DROP CONSTRAINT "GroupItems_group_member_id_fkey";

-- DropForeignKey
ALTER TABLE "GroupMembers" DROP CONSTRAINT "GroupMembers_group_id_fkey";

-- AddForeignKey
ALTER TABLE "GroupMembers" ADD CONSTRAINT "GroupMembers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupItems" ADD CONSTRAINT "GroupItems_group_member_id_fkey" FOREIGN KEY ("group_member_id") REFERENCES "GroupMembers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
