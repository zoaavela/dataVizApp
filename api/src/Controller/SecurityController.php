<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api')]
class SecurityController extends AbstractController
{
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        // Si l'utilisateur est null, c'est que le login JSON a échoué 
        // (généralement intercepté avant par le firewall, mais sécurité supplémentaire)
        if (null === $user) {
            return $this->json([
                'message' => 'Identifiants manquants',
            ], 401);
        }

        return $this->json([
            'message' => 'Connexion réussie !',
            'user' => [
                'email' => $user->getUserIdentifier(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'roles' => $user->getRoles() // Utile pour savoir si c'est un ADMIN
            ]
        ]);
    }

    #[Route('/logout', name: 'app_logout', methods: ['GET'])]
    public function logout(): void
    {
        // Cette méthode ne sera jamais exécutée car Symfony intercepte 
        // la requête de déconnexion avant d'arriver ici.
        // Elle sert uniquement à définir la route pour le routeur.
        throw new \Exception('Don\'t forget to activate logout in security.yaml');
    }
}