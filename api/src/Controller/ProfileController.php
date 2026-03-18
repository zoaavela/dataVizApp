<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/profile')]
#[IsGranted('ROLE_ADMIN')] // <-- Seuls les Admins et Super Admins ont accès
class ProfileController extends AbstractController
{
    #[Route('', name: 'api_profile_show', methods: ['GET'])]
    public function show(#[CurrentUser] User $user): JsonResponse
    {
        return $this->json([
            'email' => $user->getUserIdentifier(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'roles' => $user->getRoles()
        ]);
    }

    #[Route('', name: 'api_profile_update', methods: ['PUT'])]
    public function update(
        Request $request,
        EntityManagerInterface $em,
        #[CurrentUser] User $user,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data)) {
            return $this->json(['error' => 'Aucune donnée envoyée'], 400);
        }

        if (isset($data['nom'])) {
            $user->setNom($data['nom']);
        }

        if (isset($data['prenom'])) {
            $user->setPrenom($data['prenom']);
        }

        if (isset($data['newPassword']) && !empty($data['newPassword'])) {
            if (!isset($data['currentPassword']) || !$passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
                return $this->json(['error' => 'Le mot de passe actuel est incorrect.'], 403);
            }

            $hashedPassword = $passwordHasher->hashPassword($user, $data['newPassword']);
            $user->setPassword($hashedPassword);
        }

        $em->flush();

        return $this->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'email' => $user->getUserIdentifier(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom()
            ]
        ]);
    }
}