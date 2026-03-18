<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class SecurityController extends AbstractController
{
    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        UserRepository $userRepo,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface $JWTManager
    ): JsonResponse {
        // 1. On récupère les données envoyées par React
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password'])) {
            return $this->json(['message' => 'Identifiants manquants'], 400);
        }

        // 2. On cherche l'utilisateur dans la base de données
        $user = $userRepo->findOneBy(['email' => $data['email']]);

        // 3. On vérifie si l'utilisateur existe ET si le mot de passe est bon
        if (!$user || !$passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['message' => 'Email ou mot de passe incorrect'], 401);
        }

        // 4. Si tout est bon, on génère le token JWT
        $token = $JWTManager->create($user);

        // 5. On renvoie le token et les infos au front
        return $this->json([
            'message' => 'Connexion réussie !',
            'token' => $token,
            'user' => [
                'email' => $user->getUserIdentifier(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'roles' => $user->getRoles(),
                // On gère le cas où l'entité n'a pas encore la méthode pour éviter une erreur 500
                'adminRequestStatus' => method_exists($user, 'getAdminRequestStatus') ? $user->getAdminRequestStatus() : null
            ]
        ]);
    }

    #[Route('/logout', name: 'app_logout', methods: ['GET'])]
    public function logout(): void
    {
        throw new \Exception('This method can be blank - it will be intercepted by the logout key on your firewall');
    }
}