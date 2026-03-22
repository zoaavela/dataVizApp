<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Crée un utilisateur ADMIN ou SUPER_ADMIN',
)]
class CreateUserCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Création d\'un utilisateur Vizion');

        // --- Rôle ---
        $role = $io->choice('Quel rôle pour cet utilisateur ?', [
            'ROLE_ADMIN',
            'ROLE_SUPER_ADMIN',
        ]);

        // --- Infos utilisateur ---
        $email = $io->ask('Email', null, function (?string $value): string {
            if (empty($value) || !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                throw new \RuntimeException('Email invalide.');
            }

            // Vérifier unicité
            return $value;
        });

        $prenom = $io->ask('Prénom', null, function (?string $value): string {
            if (empty(trim($value ?? ''))) {
                throw new \RuntimeException('Le prénom ne peut pas être vide.');
            }
            return trim($value);
        });

        $nom = $io->ask('Nom', null, function (?string $value): string {
            if (empty(trim($value ?? ''))) {
                throw new \RuntimeException('Le nom ne peut pas être vide.');
            }
            return trim($value);
        });

        $plainPassword = $io->askHidden('Mot de passe (masqué)', function (?string $value): string {
            if (empty($value) || strlen($value) < 8) {
                throw new \RuntimeException('Le mot de passe doit faire au moins 8 caractères.');
            }
            return $value;
        });

        $confirm = $io->askHidden('Confirmer le mot de passe');
        if ($plainPassword !== $confirm) {
            $io->error('Les mots de passe ne correspondent pas.');
            return Command::FAILURE;
        }

        // --- Vérifier que l'email n'existe pas déjà ---
        $existing = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existing) {
            $io->error(sprintf('Un utilisateur avec l\'email "%s" existe déjà.', $email));
            return Command::FAILURE;
        }

        // --- Créer l'utilisateur ---
        $user = new User();
        $user->setEmail($email);
        $user->setPrenom($prenom);
        $user->setNom($nom);
        $user->setRoles([$role]);

        // Champs spécifiques SUPER_ADMIN
        if ($role === 'ROLE_SUPER_ADMIN') {
            $user->setSuperAdmin(true);
            $user->setAdminRequestStatus('approved');
        } else {
            $user->setSuperAdmin(false);
            $user->setAdminRequestStatus(null);
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $plainPassword);
        $user->setPassword($hashedPassword);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $io->success(sprintf(
            'Utilisateur créé avec succès ! %s %s <%s> [%s]',
            $prenom,
            $nom,
            $email,
            $role
        ));

        return Command::SUCCESS;
    }
}