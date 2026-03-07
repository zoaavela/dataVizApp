<?php

namespace App\Controller;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api')]
class SecurityController extends AbstractController
{
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user, JWTTokenManagerInterface $JWTManager): JsonResponse
    {
        if (null === $user) {
            return $this->json([
                'message' => 'Identifiants manquants',
            ], 401);
        }

        // Création du token JWT pour l'utilisateur
        $token = $JWTManager->create($user);

        return $this->json([
            'message' => 'Connexion réussie !',
            'token' => $token, // Le token est maintenant envoyé à React
            'user' => [
                'email' => $user->getUserIdentifier(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'roles' => $user->getRoles()
            ]
        ]);
    }

    #[Route('/logout', name: 'app_logout', methods: ['GET'])]
    public function logout(): void
    {
        throw new \Exception('Don\'t forget to activate logout in security.yaml');
    }
}