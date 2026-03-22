<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        // --- ADMIN ---
        $admin = new User();
        $admin->setEmail('admin@vision.fr');
        $admin->setNom('Admin');
        $admin->setPrenom('Vision');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setSuperAdmin(false);
        $admin->setAdminRequestStatus(null);
        $admin->setPassword(
            $this->passwordHasher->hashPassword($admin, 'admin1234')
        );
        $manager->persist($admin);

        // --- SUPER ADMIN ---
        $superAdmin = new User();
        $superAdmin->setEmail('superadmin@vision.fr');
        $superAdmin->setNom('Super');
        $superAdmin->setPrenom('Admin');
        $superAdmin->setRoles(['ROLE_SUPER_ADMIN']);
        $superAdmin->setSuperAdmin(true);
        $superAdmin->setAdminRequestStatus('approved');
        $superAdmin->setPassword(
            $this->passwordHasher->hashPassword($superAdmin, 'superadmin1234')
        );
        $manager->persist($superAdmin);

        $manager->flush();
    }
}